$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$releaseName = 'lighthouse-' + [DateTimeOffset]::UtcNow.ToOffset([TimeSpan]::FromHours(8)).ToString('yyyyMMdd-HHmmss')
$stagePath = Join-Path $projectRoot ('artifacts/staging/' + $releaseName)
$outputDir = Join-Path $projectRoot 'artifacts/releases'
New-Item -ItemType Directory -Path $stagePath,$outputDir -Force | Out-Null
$files = @('server/package.json', 'server/package-lock.json', 'demo/index.html', 'demo/demo.js', 'demo/auditView.js', 'demo/hologram.js', 'demo/mock-nodes.json')
foreach ($directory in @('server/src','server/test','server/scripts','server/migrations','deploy')) {
    $files += Get-ChildItem -LiteralPath (Join-Path $projectRoot $directory) -File -Recurse | ForEach-Object { $_.FullName.Substring($projectRoot.Length + 1).Replace('\','/') }
}
$manifest = @()
foreach ($relativePath in ($files | Sort-Object -Unique)) {
    if ($relativePath -match '(^|/)(node_modules|\.env)|\.log$|\.env$') { throw 'Forbidden package path' }
    $sourcePath = Join-Path $projectRoot $relativePath
    $targetPath = Join-Path $stagePath $relativePath
    New-Item -ItemType Directory -Path (Split-Path -Parent $targetPath) -Force | Out-Null
    Copy-Item -LiteralPath $sourcePath -Destination $targetPath
    $manifest += [pscustomobject]@{path=$relativePath; sha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $targetPath).Hash.ToLowerInvariant()}
}
$metadata = [ordered]@{release=$releaseName; kind='demo_api_baseline'; production_knowledge_base=$false; files=$manifest}
$metadata | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $stagePath 'release-manifest.json') -Encoding utf8
$packagePath = Join-Path $outputDir ($releaseName + '.tar.gz')
tar -czf $packagePath -C $stagePath .
if ($LASTEXITCODE -ne 0) { throw 'tar failed' }
Get-FileHash -Algorithm SHA256 -LiteralPath $packagePath | Format-List
Write-Output ('PACKAGE=' + $packagePath)
Write-Output ('RELEASE=' + $releaseName)
