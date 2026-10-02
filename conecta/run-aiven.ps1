$ErrorActionPreference = "Stop"

$serviceHost = "pg-124e318a-teixeiraheitor304-9262.g.aivencloud.com"
$servicePort = 14755
$serviceDatabase = "defaultdb"
$address = Resolve-DnsName $serviceHost -Type A -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress } |
    Select-Object -First 1 -ExpandProperty IPAddress

if (-not $address) {
    $address = Resolve-DnsName $serviceHost -Type A -Server 1.1.1.1 -ErrorAction Stop |
        Where-Object { $_.IPAddress } |
        Select-Object -First 1 -ExpandProperty IPAddress
}

if (-not $address) {
    throw "Não foi possível resolver o host do Aiven. Verifique a conexão DNS e tente novamente."
}

$env:DB_URL = "jdbc:postgresql://${address}:${servicePort}/${serviceDatabase}?sslmode=require"
$securePassword = Read-Host "Digite a senha nova do Aiven" -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    $securePassword.Dispose()
}

try {
    & .\mvnw.cmd spring-boot:run
}
finally {
    Remove-Item Env:\DB_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:\DB_URL -ErrorAction SilentlyContinue
}
