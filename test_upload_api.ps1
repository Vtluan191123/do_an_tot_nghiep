# Upload API Test Script for Windows
# Usage: .\test_upload_api.ps1 -Action upload -FilePath "C:\test.jpg"

param(
    [string]$Action = "help",
    [string]$FilePath = "",
    [string]$FilePath2 = "",
    [string]$FileUrl = "",
    [string]$BaseUrl = "http://localhost:8080"
)

$API_PATH = "/api"
$FullUrl = "${BaseUrl}${API_PATH}"

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"

Write-Host "=== Upload API Test Script ===" -ForegroundColor $Yellow
Write-Host ""

function Test-Health {
    Write-Host "Testing: Health Check" -ForegroundColor $Yellow
    $url = "${BaseUrl}/actuator/health"
    Write-Host "URL: $url" -ForegroundColor $Yellow

    try {
        $response = Invoke-RestMethod -Uri $url -Method Get
        Write-Host "Response:" -ForegroundColor $Green
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor $Green
    } catch {
        Write-Host "Error: $_" -ForegroundColor $Red
    }
    Write-Host ""
}

function Test-UploadSingle {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        Write-Host "Error: File not found: $Path" -ForegroundColor $Red
        return
    }

    Write-Host "Testing: Upload Single File" -ForegroundColor $Yellow
    Write-Host "File: $Path" -ForegroundColor $Yellow
    Write-Host "URL: ${FullUrl}/upload" -ForegroundColor $Yellow

    try {
        $form = @{
            files = Get-Item -Path $Path
        }

        $response = Invoke-RestMethod -Uri "${FullUrl}/upload" `
            -Method Post `
            -Form $form

        Write-Host "Response:" -ForegroundColor $Green
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor $Green
    } catch {
        Write-Host "Error: $_" -ForegroundColor $Red
    }
    Write-Host ""
}

function Test-UploadMultiple {
    param([string]$Path1, [string]$Path2)

    if (-not (Test-Path $Path1) -or -not (Test-Path $Path2)) {
        Write-Host "Error: One or more files not found" -ForegroundColor $Red
        return
    }

    Write-Host "Testing: Upload Multiple Files" -ForegroundColor $Yellow
    Write-Host "File 1: $Path1" -ForegroundColor $Yellow
    Write-Host "File 2: $Path2" -ForegroundColor $Yellow
    Write-Host "URL: ${FullUrl}/upload" -ForegroundColor $Yellow

    try {
        $form = @{
            files = @(Get-Item -Path $Path1, Get-Item -Path $Path2)
        }

        $response = Invoke-RestMethod -Uri "${FullUrl}/upload" `
            -Method Post `
            -Form $form

        Write-Host "Response:" -ForegroundColor $Green
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor $Green
    } catch {
        Write-Host "Error: $_" -ForegroundColor $Red
    }
    Write-Host ""
}

function Test-DeleteFile {
    param([string]$Url)

    Write-Host "Testing: Delete File" -ForegroundColor $Yellow
    Write-Host "File URL: $Url" -ForegroundColor $Yellow
    Write-Host "API URL: ${FullUrl}/delete" -ForegroundColor $Yellow

    try {
        $response = Invoke-RestMethod -Uri "${FullUrl}/delete?files=$([uri]::EscapeUriString($Url))" `
            -Method Delete

        Write-Host "Response:" -ForegroundColor $Green
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor $Green
    } catch {
        Write-Host "Error: $_" -ForegroundColor $Red
    }
    Write-Host ""
}

function Show-Usage {
    $usage = @"
Usage:
    .\test_upload_api.ps1 -Action [action] -[parameters]

Actions:
    health                  - Check API health
    upload                  - Upload single file (requires -FilePath)
    upload-multi            - Upload multiple files (requires -FilePath -FilePath2)
    delete                  - Delete file by URL (requires -FileUrl)
    help                    - Show this help

Parameters:
    -Action [action]        - Action to perform (default: help)
    -FilePath [path]        - Path to file for upload
    -FilePath2 [path]       - Path to second file for multi-upload
    -FileUrl [url]          - URL of file to delete
    -BaseUrl [url]          - API base URL (default: http://localhost:8080)

Examples:
    # Check health
    .\test_upload_api.ps1 -Action health

    # Upload single file
    .\test_upload_api.ps1 -Action upload -FilePath "C:\test.jpg"

    # Upload multiple files
    .\test_upload_api.ps1 -Action upload-multi -FilePath "C:\test1.jpg" -FilePath2 "C:\test2.pdf"

    # Delete file
    .\test_upload_api.ps1 -Action delete -FileUrl "https://bucket.sgp1.cdn.digitaloceanspaces.com/uuid_file.jpg"

    # With custom base URL
    .\test_upload_api.ps1 -Action health -BaseUrl "https://myapi.com"
"@
    Write-Host $usage
}

# Main
switch ($Action.ToLower()) {
    "health" {
        Test-Health
    }
    "upload" {
        if ([string]::IsNullOrEmpty($FilePath)) {
            Write-Host "Error: FilePath required" -ForegroundColor $Red
            Show-Usage
            exit 1
        }
        Test-UploadSingle -Path $FilePath
    }
    "upload-multi" {
        if ([string]::IsNullOrEmpty($FilePath) -or [string]::IsNullOrEmpty($FilePath2)) {
            Write-Host "Error: Both FilePath and FilePath2 required" -ForegroundColor $Red
            Show-Usage
            exit 1
        }
        Test-UploadMultiple -Path1 $FilePath -Path2 $FilePath2
    }
    "delete" {
        if ([string]::IsNullOrEmpty($FileUrl)) {
            Write-Host "Error: FileUrl required" -ForegroundColor $Red
            Show-Usage
            exit 1
        }
        Test-DeleteFile -Url $FileUrl
    }
    "help" {
        Show-Usage
    }
    default {
        Write-Host "Unknown action: $Action" -ForegroundColor $Red
        Show-Usage
        exit 1
    }
}

