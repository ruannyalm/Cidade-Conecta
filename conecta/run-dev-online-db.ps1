$ErrorActionPreference = "Stop"

Write-Host "This starts the local Spring Boot API against a remote PostgreSQL development database."
Write-Warning "The startup will insert the seven [EXEMPLO] rows if they are not already present. Never use production database credentials."

$confirmation = Read-Host "Type SEED-DEV to confirm this is an isolated development/test database"
if ($confirmation -cne "SEED-DEV") {
    throw "Confirmation did not match. No database connection was started."
}

$databaseUrl = Read-Host "Remote PostgreSQL JDBC URL"
$databaseUsername = Read-Host "Database username"
$securePassword = Read-Host "Database password" -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
    $env:DB_URL = $databaseUrl
    $env:DB_USERNAME = $databaseUsername
    $env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    $env:DEMO_DATA_ENABLED = "true"

    Set-Location $PSScriptRoot
    & .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
    if ($LASTEXITCODE -ne 0) {
        throw "Spring Boot stopped with exit code $LASTEXITCODE."
    }
}
finally {
    Remove-Item Env:DB_URL, Env:DB_USERNAME, Env:DB_PASSWORD, Env:DEMO_DATA_ENABLED -ErrorAction SilentlyContinue
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    $securePassword.Dispose()
}
