#!/usr/bin/env pwsh
# Quick API test script
# Usage: .\test-api.ps1

$BASE_URL = "http://localhost:4000"
$EMAIL = "jane.doe@example.com"
$PASSWORD = "password123"

Write-Host "🧪 Testing eKYC API" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Test 1: Health check
Write-Host "`n1️⃣  Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/health" -ErrorAction Stop
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2 | Write-Host
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Login
Write-Host "`n2️⃣  Login" -ForegroundColor Yellow
try {
    $body = @{
        email = $EMAIL
        password = $PASSWORD
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "$BASE_URL/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "User: $($data.user.fullName)" -ForegroundColor Green
    
    $accessToken = $data.session.accessToken
    $refreshToken = $data.session.refreshToken
    
    Write-Host "Access Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Get current user (/v1/me)
Write-Host "`n3️⃣  Get Current User" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest `
        -Uri "$BASE_URL/v1/me" `
        -Headers @{ "Authorization" = "Bearer $accessToken" } `
        -ErrorAction Stop

    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2 | Write-Host
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 4: Get verification status
Write-Host "`n4️⃣  Get Verification Status" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest `
        -Uri "$BASE_URL/v1/verification/status" `
        -Headers @{ "Authorization" = "Bearer $accessToken" } `
        -ErrorAction Stop

    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2 | Write-Host
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 5: Submit onboarding
Write-Host "`n5️⃣  Submit Onboarding" -ForegroundColor Yellow
try {
    $body = @{
        draft = @{
            profile = @{
                fullName = "Jane Doe"
                dateOfBirth = "1990-05-15"
                nationality = "US"
            }
            document = @{
                documentType = "PASSPORT"
                documentNumber = "P12345678"
            }
            address = @{
                addressLine1 = "123 Main St"
                city = "Springfield"
                country = "US"
            }
            consents = @{
                termsAccepted = $true
            }
        }
    } | ConvertTo-Json -Depth 10

    $response = Invoke-WebRequest `
        -Uri "$BASE_URL/v1/onboarding/submit" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $accessToken" } `
        -Body $body `
        -ErrorAction Stop

    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2 | Write-Host
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 6: Check status after submit
Write-Host "`n6️⃣  Check Verification Status After Submit" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest `
        -Uri "$BASE_URL/v1/verification/status" `
        -Headers @{ "Authorization" = "Bearer $accessToken" } `
        -ErrorAction Stop

    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2 | Write-Host
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 7: Refresh token
Write-Host "`n7️⃣  Refresh Token" -ForegroundColor Yellow
try {
    $body = @{
        refreshToken = $refreshToken
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "$BASE_URL/v1/auth/refresh" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "New Access Token: $($data.accessToken.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 8: Validation error (missing fields)
Write-Host "`n8️⃣  Test Validation Error (Incomplete Submission)" -ForegroundColor Yellow
try {
    $body = @{
        draft = @{
            profile = @{
                fullName = "Test User"
                # Missing dateOfBirth and nationality
            }
            document = @{}
            address = @{}
            consents = @{}
        }
    } | ConvertTo-Json -Depth 10

    $response = Invoke-WebRequest `
        -Uri "$BASE_URL/v1/onboarding/submit" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $accessToken" } `
        -Body $body `
        -ErrorAction Stop
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Correctly returned 400 error" -ForegroundColor Green
        $errorContent = $_.Exception.Response.Content.ReadAsStream()
        $reader = [System.IO.StreamReader]::new($errorContent)
        $errorBody = $reader.ReadToEnd()
        $errorBody | ConvertFrom-Json | ConvertTo-Json -Depth 5 | Write-Host
    } else {
        Write-Host "❌ Unexpected error: $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
