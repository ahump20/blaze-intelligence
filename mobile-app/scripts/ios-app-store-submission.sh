#!/bin/bash

# Blaze Intelligence iOS App Store Submission Script
# Automates the complete iOS app submission process

set -e

echo "🍎 Starting iOS App Store submission process for Blaze Intelligence..."

# Configuration
APP_NAME="Blaze Intelligence"
BUNDLE_ID="com.blazeintelligence.mobile"
SCHEME="BlazeIntelligence"
WORKSPACE="BlazeIntelligence.xcworkspace"
BUILD_CONFIG="Release"
ARCHIVE_PATH="./build/BlazeIntelligence.xcarchive"
IPA_PATH="./build/BlazeIntelligence.ipa"
EXPORT_OPTIONS_PLIST="./ios/ExportOptions.plist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Xcode is installed
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode is not installed or not in PATH"
        exit 1
    fi
    
    # Check if xcrun is available
    if ! command -v xcrun &> /dev/null; then
        print_error "xcrun is not available"
        exit 1
    fi
    
    # Check if we're in the correct directory
    if [ ! -d "ios" ]; then
        print_error "This script must be run from the React Native project root"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install npm dependencies
    npm install
    
    # Install CocoaPods dependencies
    cd ios
    pod install --repo-update
    cd ..
    
    print_success "Dependencies installed"
}

# Create export options plist
create_export_options() {
    print_status "Creating export options plist..."
    
    cat > "$EXPORT_OPTIONS_PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>\${APPLE_TEAM_ID}</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>provisioningProfiles</key>
    <dict>
        <key>$BUNDLE_ID</key>
        <string>\${PROVISIONING_PROFILE_NAME}</string>
    </dict>
    <key>signingStyle</key>
    <string>manual</string>
    <key>signingCertificate</key>
    <string>iPhone Distribution</string>
</dict>
</plist>
EOF
    
    print_success "Export options plist created"
}

# Clean and build
clean_build() {
    print_status "Cleaning previous builds..."
    
    # Clean React Native
    npx react-native clean
    
    # Clean iOS build directory
    rm -rf ios/build
    rm -rf build
    mkdir -p build
    
    # Clean Xcode derived data
    xcodebuild clean -workspace "ios/$WORKSPACE" -scheme "$SCHEME" -configuration "$BUILD_CONFIG"
    
    print_success "Clean completed"
}

# Archive the app
archive_app() {
    print_status "Archiving the app..."
    
    xcodebuild archive \
        -workspace "ios/$WORKSPACE" \
        -scheme "$SCHEME" \
        -configuration "$BUILD_CONFIG" \
        -archivePath "$ARCHIVE_PATH" \
        -allowProvisioningUpdates \
        CODE_SIGN_IDENTITY="iPhone Distribution" \
        DEVELOPMENT_TEAM="${APPLE_TEAM_ID}" \
        PROVISIONING_PROFILE_SPECIFIER="${PROVISIONING_PROFILE_NAME}"
    
    if [ $? -eq 0 ]; then
        print_success "Archive created successfully"
    else
        print_error "Archive failed"
        exit 1
    fi
}

# Export IPA
export_ipa() {
    print_status "Exporting IPA..."
    
    xcodebuild -exportArchive \
        -archivePath "$ARCHIVE_PATH" \
        -exportPath "./build" \
        -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
        -allowProvisioningUpdates
    
    if [ $? -eq 0 ]; then
        print_success "IPA exported successfully"
        print_status "IPA location: $IPA_PATH"
    else
        print_error "IPA export failed"
        exit 1
    fi
}

# Validate app
validate_app() {
    print_status "Validating app with App Store..."
    
    xcrun altool --validate-app \
        --file "$IPA_PATH" \
        --type ios \
        --username "${APPLE_ID_EMAIL}" \
        --password "${APP_SPECIFIC_PASSWORD}"
    
    if [ $? -eq 0 ]; then
        print_success "App validation passed"
    else
        print_warning "App validation failed - please check the issues and retry"
    fi
}

# Upload to App Store Connect
upload_to_app_store() {
    print_status "Uploading to App Store Connect..."
    
    xcrun altool --upload-app \
        --file "$IPA_PATH" \
        --type ios \
        --username "${APPLE_ID_EMAIL}" \
        --password "${APP_SPECIFIC_PASSWORD}"
    
    if [ $? -eq 0 ]; then
        print_success "App uploaded successfully to App Store Connect!"
        print_status "Please check App Store Connect to complete the submission process"
    else
        print_error "App upload failed"
        exit 1
    fi
}

# Generate app metadata
generate_metadata() {
    print_status "Generating App Store metadata..."
    
    # Read the iOS app store configuration
    if [ -f "ios-app-store-config.json" ]; then
        print_status "Using existing app store configuration"
    else
        print_warning "ios-app-store-config.json not found, creating basic metadata"
    fi
    
    # Create screenshots directory structure
    mkdir -p "./app-store-assets/screenshots/ios"
    mkdir -p "./app-store-assets/metadata"
    
    # Generate metadata files
    cat > "./app-store-assets/metadata/description.txt" << EOF
Transform your athletic performance with Blaze Intelligence - the revolutionary AI-powered sports analysis platform.

KEY FEATURES:
• Real-time biomechanical analysis with 33-point body tracking
• Advanced micro-expression detection for character assessment
• Multi-AI processing with ChatGPT 5, Claude Opus 4.1, and Gemini 2.5 Pro
• Live sports data integration for MLB, NFL, NBA, and NCAA teams
• Comprehensive performance metrics and Blaze Score calculation
• Professional-grade video analysis and coaching insights

SPORTS COVERAGE:
• MLB Cardinals real-time analytics
• NFL Titans performance tracking
• NBA Grizzlies team insights
• NCAA Longhorns college sports data

Whether you're a coach, athlete, or sports enthusiast, Blaze Intelligence provides the cutting-edge tools you need to turn data into dominance on the field.

Download now and experience the future of sports analytics!
EOF

    cat > "./app-store-assets/metadata/keywords.txt" << EOF
sports,analytics,AI,baseball,football,basketball,coaching,performance,biomechanics,video analysis,MLB,NFL,NBA,NCAA,training,athlete development,sports intelligence
EOF

    print_success "Metadata generated"
}

# Main execution
main() {
    echo "🚀 Blaze Intelligence iOS App Store Submission"
    echo "============================================="
    
    # Check environment variables
    if [ -z "$APPLE_TEAM_ID" ] || [ -z "$APPLE_ID_EMAIL" ] || [ -z "$APP_SPECIFIC_PASSWORD" ]; then
        print_error "Missing required environment variables:"
        echo "  - APPLE_TEAM_ID: Your Apple Developer Team ID"
        echo "  - APPLE_ID_EMAIL: Your Apple ID email"
        echo "  - APP_SPECIFIC_PASSWORD: App-specific password for your Apple ID"
        echo "  - PROVISIONING_PROFILE_NAME: Name of your provisioning profile"
        exit 1
    fi
    
    check_prerequisites
    install_dependencies
    create_export_options
    clean_build
    archive_app
    export_ipa
    validate_app
    generate_metadata
    
    print_success "🎉 iOS submission preparation complete!"
    echo ""
    echo "Next steps:"
    echo "1. Review the generated metadata in ./app-store-assets/"
    echo "2. Add screenshots to ./app-store-assets/screenshots/ios/"
    echo "3. Upload to App Store Connect: run upload_to_app_store function"
    echo "4. Complete the submission in App Store Connect dashboard"
    echo ""
    echo "To upload now, run: upload_to_app_store"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi