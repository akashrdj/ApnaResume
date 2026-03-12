# Quick Setup Script for Enhanced Resume Editor

Write-Host "🚀 Setting up Enhanced Resume Editor..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
} else {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  IMPORTANT: Edit .env and add your Gemini API key!" -ForegroundColor Red
    Write-Host "   Get your key from: https://makersuite.google.com/app/apikey" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Installing required dependencies..." -ForegroundColor Cyan
npm install @google/generative-ai react-contenteditable

Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file and add your Gemini API key"
Write-Host "2. Run: npm run dev"
Write-Host "3. Open your browser and test the new features!"
Write-Host ""
Write-Host "💡 See IMPLEMENTATION_GUIDE.md for detailed instructions" -ForegroundColor Yellow
