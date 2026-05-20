$project = $PSScriptRoot
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

git -C $project add -A
$diff = git -C $project diff --cached --name-only
if ($diff) {
    $date = Get-Date -Format "yyyy-MM-dd HH:mm"
    git -C $project commit -m "Auto-update: $date"
    git -C $project push
}
