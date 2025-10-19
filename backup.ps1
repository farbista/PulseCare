# PowerShell script to backup database
$env:PGPASSWORD = "npg_F8b7MTjVPSQd"
$command = "pg_dump -h ep-blue-smoke-a1s439xu-pooler.ap-southeast-1.aws.neon.tech -U neondb_owner -d neondb"

# Try to run pg_dump
try {
    Invoke-Expression "$command > backup.sql"
    Write-Host "Backup completed successfully!"
} catch {
    Write-Host "Error: pg_dump not found. Please install PostgreSQL tools."
    Write-Host "Alternatively, use Neon Console to create backup: https://console.neon.tech/"
}