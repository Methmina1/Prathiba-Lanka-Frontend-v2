# Reads the tour-package workbook and writes JSON for the importer:
#
#   powershell -ExecutionPolicy Bypass -File scripts/extract-tour-packages.ps1 `
#       -Workbook "..\SriLanka_Extended_TourPackages.xlsx" -Out packages.json
#
# The workbook has one overview sheet plus one sheet per package. Each package sheet is the
# authoritative one - it carries the day-by-day itinerary and the hotel table, and where it disagrees
# with the overview (prices, locations) the sheet is what the importer uses.
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Workbook,
    [string]$Out = 'packages.json'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $Workbook))

function Read-Entry($zip, $name) {
    $entry = $zip.Entries | Where-Object { $_.FullName -eq $name }
    if (-not $entry) { return $null }
    $reader = New-Object System.IO.StreamReader($entry.Open())
    $text = $reader.ReadToEnd(); $reader.Close(); return $text
}

[xml]$sharedXml = Read-Entry $zip 'xl/sharedStrings.xml'
$shared = @($sharedXml.sst.si | ForEach-Object { $_.InnerText })

function Get-SheetRows($zip, $sheetFile, $shared) {
    [xml]$sheet = Read-Entry $zip "xl/worksheets/$sheetFile"
    $rows = @()
    foreach ($row in $sheet.worksheet.sheetData.row) {
        $cells = [ordered]@{}
        foreach ($c in $row.c) {
            $col = ($c.r -replace '\d', '')
            $value = switch ($c.t) {
                's' { $shared[[int]$c.v] }
                'inlineStr' { $c.is.InnerText }
                default { [string]$c.v }
            }
            if ($value) { $cells[$col] = $value.Trim() }
        }
        if ($cells.Count -gt 0) { $rows += ,$cells }
    }
    return $rows
}

function Cell($row, $col) { if ($row.Contains($col)) { return $row[$col] } else { return $null } }

function Get-LabelledPairs($row) {
    # Labels and values do not sit in fixed columns. Row 2 of every package sheet carries three
    # pairs side by side ("Duration:"|B2, "Base Price:"|D2, "Experience:"|F2), so walk the row left
    # to right: a cell that is just "Label:" opens a pair, and the next cell closes it - whatever it
    # holds. (Some Experience values are themselves qualified, e.g. "Luxury: Cultural, Wildlife ...",
    # so an open pair must be closed before the next cell is read as a label of its own.)
    $pairs = [ordered]@{}
    $pending = $null
    foreach ($col in $row.Keys) {
        $text = $row[$col]
        if ($pending) { $pairs[$pending] = $text.Trim(); $pending = $null; continue }
        if ($text -match '^(?<label>[A-Za-z][A-Za-z /&]*):\s*(?<value>.*)$') {
            $label = $Matches['label'].Trim().ToUpperInvariant()
            $value = $Matches['value'].Trim()
            if ($value) { $pairs[$label] = $value } else { $pending = $label }
        }
    }
    return $pairs
}

$overviewRows = Get-SheetRows $zip 'sheet1.xml' $shared
$overview = @()
foreach ($row in $overviewRows) {
    $number = Cell $row 'A'
    if ($number -notmatch '^\d+$') { continue }
    $overview += [ordered]@{
        number            = [int]$number
        name              = Cell $row 'B'
        subtitle          = Cell $row 'C'
        duration          = Cell $row 'D'
        price             = Cell $row 'E'
        locations         = Cell $row 'F'
        experience        = Cell $row 'G'
        days              = Cell $row 'H'
        nights            = Cell $row 'I'
        accommodation     = Cell $row 'J'
        nightsPerLocation = Cell $row 'K'
    }
}

$packages = @()
for ($sheetNumber = 2; $sheetNumber -le 14; $sheetNumber++) {
    $rows = Get-SheetRows $zip "sheet$sheetNumber.xml" $shared
    if (-not $rows) { continue }

    $package = [ordered]@{
        sheet = "sheet$sheetNumber"; heading = Cell $rows[0] 'A'
        number = $null; overviewName = $null; accommodation = $null
        duration = $null; price = $null; experience = $null; locations = $null
        days = @(); stays = @(); notes = $null
    }

    $state = 'head'
    foreach ($row in $rows) {
        $a = Cell $row 'A'; $b = Cell $row 'B'

        if ($a -like '*DAY-BY-DAY*') { $state = 'daysHeader'; continue }
        if ($a -like '*ACCOMMODATION DETAILS*') { $state = 'staysHeader'; continue }
        if ($a -like '*Base price per person*') { $package.notes = "$a $b".Trim(); continue }

        switch ($state) {
            'head' {
                $pairs = Get-LabelledPairs $row
                if ($pairs.Contains('DURATION')) { $package.duration = $pairs['DURATION'] }
                if ($pairs.Contains('BASE PRICE')) { $package.price = $pairs['BASE PRICE'] }
                if ($pairs.Contains('EXPERIENCE')) { $package.experience = $pairs['EXPERIENCE'] }
                foreach ($col in $row.Keys) {
                    # "📍  LOCATIONS:   Colombo · Sigiriya · Kandy" arrives as one cell, label included
                    if ($row[$col] -like '*LOCATIONS*') { $package.locations = ($row[$col] -split ':', 2)[1].Trim() }
                }
            }
            'daysHeader' { $state = 'days' }
            'days' { if ($a -match '^Day\s*(\d+)') { $package.days += [ordered]@{ day = [int]$Matches[1]; text = $b } } }
            'staysHeader' { $state = 'stays' }
            'stays' {
                if ($a -ne 'Location' -and $a -and $b) {
                    $package.stays += [ordered]@{ location = $a; hotel = $b; nights = (Cell $row 'E') }
                }
            }
        }
    }

    $packages += $package
}

# The overview sheet is an earlier draft (its locations and prices disagree with the itineraries),
# so the package sheets win. It is still the only place that carries the accommodation tier, and it
# is the fallback when a sheet leaves Experience blank.
foreach ($package in $packages) {
    $heading = ([string]$package.heading).ToUpperInvariant()
    $match = $overview | Where-Object { $heading.Contains(([string]$_.name).ToUpperInvariant()) } | Select-Object -First 1
    if (-not $match) { continue }
    $package.number = $match.number
    $package.overviewName = $match.name
    $package.accommodation = $match.accommodation
    if (-not $package.experience) { $package.experience = $match.experience }
}

$zip.Dispose()
$json = [ordered]@{ overview = $overview; packages = $packages } | ConvertTo-Json -Depth 8

# Write without a BOM: Windows PowerShell's "Set-Content -Encoding UTF8" prepends one, and
# JSON.parse() in the importer chokes on it.
$target = if ([System.IO.Path]::IsPathRooted($Out)) { $Out } else { Join-Path (Get-Location).ProviderPath $Out }
[System.IO.File]::WriteAllText($target, $json, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "overview rows  : $($overview.Count)"
Write-Host "package sheets : $($packages.Count)"
Write-Host "written        : $target"
