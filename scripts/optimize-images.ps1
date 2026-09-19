#requires -Version 5.1
<#
.SYNOPSIS
    Turns full-resolution photographs into web-sized JPEGs.

.DESCRIPTION
    The originals supplied for this site are camera/stock exports: 1-13 MB each, straight off the
    sensor. Serving them as-is makes every page load tens of megabytes, and anything over 10 MB is
    refused by the media endpoint anyway.

    This writes two variants per source image into the destination folder:

        <slug>-lg.jpg   max 1920px on the long edge, quality 82  - heroes, covers, page headers
        <slug>-sm.jpg   max 900px on the long edge,  quality 78  - gallery tiles, card strips

    EXIF is dropped by re-encoding (so GPS coordinates from the camera never ship with the site),
    and the EXIF orientation flag is applied to the pixels first, so portrait photos are not saved
    sideways.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts/optimize-images.ps1 `
        -Source "public/images/Sri lanka" -Destination ".image-work"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Destination,
    [int]$LargeEdge = 1920,
    [int]$LargeQuality = 82,
    [int]$SmallEdge = 900,
    [int]$SmallQuality = 78
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }

function Get-Slug([string]$name) {
    $slug = [System.IO.Path]::GetFileNameWithoutExtension($name).ToLowerInvariant()
    $slug = $slug -replace '-unsplash$', ''
    $slug = $slug -replace '[^a-z0-9]+', '-'
    return $slug.Trim('-')
}

function Save-Resized {
    param(
        [System.Drawing.Image]$Image,
        [int]$Edge,
        [int]$Quality,
        [string]$Path
    )

    # Never enlarge: a 900px photo stays 900px.
    $scale = [Math]::Min($Edge / $Image.Width, $Edge / $Image.Height)
    if ($scale -gt 1) { $scale = 1 }
    $width = [Math]::Max(1, [int][Math]::Round($Image.Width * $scale))
    $height = [Math]::Max(1, [int][Math]::Round($Image.Height * $scale))

    # EXIF orientation 6 and 8 are the same photo turned a quarter turn, so the box is transposed.
    $orientation = 1
    if ($Image.PropertyIdList -contains 0x0112) {
        $orientation = $Image.GetPropertyItem(0x0112).Value[0]
    }
    $quarterTurn = $orientation -in 6, 8

    $canvasWidth = if ($quarterTurn) { $height } else { $width }
    $canvasHeight = if ($quarterTurn) { $width } else { $height }

    $canvas = New-Object System.Drawing.Bitmap($canvasWidth, $canvasHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($Image, 0, 0, $width, $height)

        switch ($orientation) {
            3 { $canvas.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
            6 { $canvas.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
            8 { $canvas.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
        }

        $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
            [System.Drawing.Imaging.Encoder]::Quality, [int64]$Quality)
        $canvas.Save($Path, $jpegCodec, $parameters)
    } finally {
        $graphics.Dispose()
        $canvas.Dispose()
    }

    return [pscustomobject]@{ Width = $canvasWidth; Height = $canvasHeight }
}

if (-not (Test-Path $Destination)) { New-Item -ItemType Directory -Path $Destination -Force | Out-Null }
$Destination = (Resolve-Path $Destination).Path

$sources = Get-ChildItem -Path $Source -File |
    Where-Object { $_.Extension -match '^\.(jpe?g|png)$' } |
    Sort-Object Name

Write-Host "Optimising $($sources.Count) file(s) from $Source" -ForegroundColor Cyan
$before = 0
$after = 0

foreach ($file in $sources) {
    $slug = Get-Slug $file.Name
    $image = [System.Drawing.Image]::FromFile($file.FullName)
    try {
        $largePath = Join-Path $Destination "$slug-lg.jpg"
        $smallPath = Join-Path $Destination "$slug-sm.jpg"

        $large = Save-Resized -Image $image -Edge $LargeEdge -Quality $LargeQuality -Path $largePath
        $small = Save-Resized -Image $image -Edge $SmallEdge -Quality $SmallQuality -Path $smallPath

        $before += $file.Length
        $after += (Get-Item $largePath).Length + (Get-Item $smallPath).Length

        Write-Host ("  {0,-58} {1,6} KB -> {2,4} KB lg / {3,4} KB sm  ({4}x{5})" -f `
            $file.Name, [int]($file.Length / 1KB), [int]((Get-Item $largePath).Length / 1KB), `
            [int]((Get-Item $smallPath).Length / 1KB), $large.Width, $large.Height)
    } finally {
        $image.Dispose()
    }
}

Write-Host ''
Write-Host ("Total: {0:N1} MB of originals -> {1:N1} MB of web files" -f ($before / 1MB), ($after / 1MB)) -ForegroundColor Green
