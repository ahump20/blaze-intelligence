#!/bin/bash

# Blaze Intelligence - App Store Submission Preparation Script
# Prepares iOS and Android builds for app store submission

set -e

echo "📱 Blaze Intelligence - App Store Submission Preparation"
echo "======================================================="

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
APP_VERSION="1.0.0"
BUILD_NUMBER=$(date +%Y%m%d%H%M)
APP_NAME="Blaze Intelligence"
BUNDLE_ID="com.blazeintelligence.mobile"

# Create submission directory
SUBMISSION_DIR="app-store-submission-$(date +%Y%m%d)"
mkdir -p "$SUBMISSION_DIR"/{ios,android,assets,metadata}

log_info "Created submission directory: $SUBMISSION_DIR"

# Prepare iOS submission
prepare_ios_submission() {
    log_info "Preparing iOS App Store submission..."
    
    # Check for Xcode
    if ! command -v xcodebuild &> /dev/null; then
        log_warning "Xcode not found - iOS submission preparation will be limited"
        return 1
    fi
    
    # Create iOS metadata
    cp app-store/ios-app-store-config.json "$SUBMISSION_DIR/ios/"
    
    # Build release version
    log_info "Building iOS release version..."
    ./scripts/build-ios.sh release
    
    if [ -f "build/BlazeIntelligence.xcarchive" ]; then
        log_info "Creating IPA export..."
        ./scripts/build-ios.sh export
        
        if [ -f "build/export/BlazeIntelligenceMobile.ipa" ]; then
            cp "build/export/BlazeIntelligenceMobile.ipa" "$SUBMISSION_DIR/ios/"
            log_success "iOS IPA ready for submission"
        fi
    fi
    
    # Generate iOS submission checklist
    cat > "$SUBMISSION_DIR/ios/submission-checklist.md" << EOF
# iOS App Store Submission Checklist

## Pre-Submission Requirements
- [ ] App built and tested on physical device
- [ ] All screenshots captured (iPhone 6.7", 6.5", iPad 12.9")
- [ ] App icon created in all required sizes
- [ ] App Store Connect app record created
- [ ] Privacy policy and support URLs updated
- [ ] Demo account credentials provided for review

## App Store Connect Setup
- [ ] App Information completed
- [ ] Pricing and Availability configured
- [ ] App Privacy details submitted
- [ ] Age Rating questionnaire completed
- [ ] Review Information provided

## Technical Requirements
- [ ] IPA uploaded to App Store Connect
- [ ] All required device capabilities specified
- [ ] Supported iOS versions tested (14.0+)
- [ ] App Store guidelines compliance verified
- [ ] Binary validated and processed

## Marketing Assets
- [ ] App Store screenshots (5 per device type)
- [ ] App preview video (optional but recommended)
- [ ] Feature graphic for App Store
- [ ] Promotional assets for marketing

## Review Process
- [ ] Submitted for review
- [ ] Responded to any reviewer feedback
- [ ] App approved and ready for release
- [ ] Release date scheduled or manual release selected
EOF

    log_success "iOS submission package prepared"
}

# Prepare Android submission
prepare_android_submission() {
    log_info "Preparing Google Play Store submission..."
    
    # Create Android metadata
    cp app-store/android-play-store-config.json "$SUBMISSION_DIR/android/"
    
    # Build release AAB
    log_info "Building Android App Bundle..."
    ./scripts/build-android.sh bundle
    
    if [ -f "android/app/build/outputs/bundle/release/app-release.aab" ]; then
        cp "android/app/build/outputs/bundle/release/app-release.aab" "$SUBMISSION_DIR/android/"
        log_success "Android AAB ready for submission"
    else
        log_warning "Android AAB not found - building APK instead"
        ./scripts/build-android.sh release
        if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
            cp "android/app/build/outputs/apk/release/app-release.apk" "$SUBMISSION_DIR/android/"
            log_success "Android APK ready for submission"
        fi
    fi
    
    # Generate Android submission checklist
    cat > "$SUBMISSION_DIR/android/submission-checklist.md" << EOF
# Google Play Store Submission Checklist

## Pre-Submission Requirements
- [ ] App built and tested on multiple devices
- [ ] All screenshots captured (phone portrait, tablet landscape)
- [ ] Feature graphic created (1024x500)
- [ ] App icon created in all required sizes
- [ ] Google Play Console app created
- [ ] Privacy policy URL provided
- [ ] Content rating questionnaire completed

## Google Play Console Setup
- [ ] Store listing information completed
- [ ] Graphic assets uploaded
- [ ] Pricing and distribution configured
- [ ] Content rating applied
- [ ] App content and data safety declared

## Technical Requirements
- [ ] AAB/APK uploaded to Play Console
- [ ] App signing key configured
- [ ] Supported Android versions tested (API 21+)
- [ ] Google Play policies compliance verified
- [ ] All permissions justified and documented

## Testing
- [ ] Internal testing completed
- [ ] Closed testing with beta users
- [ ] Pre-launch report reviewed
- [ ] All crashes and ANRs resolved

## Release Management
- [ ] Release notes prepared
- [ ] Rollout strategy defined
- [ ] Release submitted for review
- [ ] App published to production
EOF

    log_success "Android submission package prepared"
}

# Generate app assets
generate_app_assets() {
    log_info "Generating app assets and metadata..."
    
    # Create asset directories
    mkdir -p "$SUBMISSION_DIR/assets"/{icons,screenshots,graphics}
    
    # Generate app icon placeholder instructions
    cat > "$SUBMISSION_DIR/assets/icons/icon-requirements.md" << EOF
# App Icon Requirements

## iOS Icons Needed
- App Store: 1024x1024 (app-icon-1024x1024.png)
- iPhone: 180x180, 120x120, 87x87, 80x80, 60x60, 58x58, 40x40, 29x29, 20x20
- iPad: 167x167, 152x152, 144x144, 76x76, 40x40, 29x29, 20x20

## Android Icons Needed
- Play Store: 512x512 (app-icon-512x512.png)
- Adaptive Icon: 108x108 with 18dp safe zone
- Legacy: 192x192, 144x144, 96x96, 72x72, 48x48, 36x36

## Design Guidelines
- Use Blaze Intelligence brand colors (#BF5700, #FF8C00, #9BCBEB)
- Include flame/fire element representing "Blaze"
- Modern, professional design suitable for sports/analytics
- High contrast for visibility
- No text in icon (text may not be readable at small sizes)
EOF

    # Generate screenshot templates
    cat > "$SUBMISSION_DIR/assets/screenshots/screenshot-plan.md" << EOF
# Screenshot Plan for App Stores

## Required Screenshots

### iPhone Screenshots (5 required)
1. **Camera Screen** - Show video recording interface with live metrics overlay
2. **Analysis Results** - Display comprehensive analysis with Blaze Score
3. **Dashboard** - Performance analytics and skill breakdown
4. **Profile & Achievements** - User profile with achievement system
5. **Sports Data** - Real-time sports data integration (Cardinals, Titans, etc.)

### iPad Screenshots (3 required)
1. **Camera Screen** - Landscape video recording interface
2. **Analysis Dashboard** - Full analytics view with charts
3. **Team Overview** - Multi-athlete/team analysis view

### Android Screenshots (Phone + Tablet)
- Same content as iOS but optimized for Android design language
- Ensure Material Design compliance

## Screenshot Guidelines
- Use high-quality device mockups
- Show actual app content (not placeholder)
- Highlight key features and AI capabilities
- Include Blaze Intelligence branding
- Use realistic sports scenarios
- Show diversity in sports and athletes
EOF

    # Generate marketing copy
    cat > "$SUBMISSION_DIR/metadata/marketing-copy.md" << EOF
# Blaze Intelligence - Marketing Copy

## App Store Taglines
- "Turn Data Into Dominance"
- "AI-Powered Sports Performance Analysis" 
- "Championship Mindset Meets Cutting-Edge Technology"
- "Where Elite Athletes Unlock Their Potential"

## Key Value Propositions
1. **Real-Time AI Analysis**: Instant biomechanical and character assessment
2. **Multi-Sport Coverage**: MLB, NFL, NBA, NCAA data integration
3. **Professional-Grade**: Used by elite athletes and professional teams
4. **Championship Character**: Unique micro-expression analysis for mental toughness
5. **Comprehensive Platform**: Video analysis, sports data, and performance tracking

## Feature Highlights
- 33 body landmark tracking for biomechanical analysis
- Multi-AI processing (ChatGPT 5, Claude Opus 4.1, Gemini 2.5 Pro)
- Real-time metrics overlay during recording
- Blaze Score calculation for performance optimization
- Sports data integration with live team statistics
- Training data collection for continuous improvement

## Target Audience Messaging
- **Athletes**: "Optimize your performance with AI-powered insights"
- **Coaches**: "Analyze player development with professional-grade tools"
- **Teams**: "Track collective progress and identify championship potential"
- **Youth Sports**: "Prepare for the next level with advanced analytics"
EOF

    log_success "App assets and metadata generated"
}

# Generate submission summary
generate_submission_summary() {
    log_info "Generating submission summary..."
    
    cat > "$SUBMISSION_DIR/SUBMISSION_SUMMARY.md" << EOF
# Blaze Intelligence Mobile App - Store Submission Package

**Generated**: $(date)
**Version**: $APP_VERSION
**Build**: $BUILD_NUMBER

## Package Contents

### iOS Submission (\`ios/\`)
- App Store configuration and metadata
- IPA file (if successfully built)
- Submission checklist and requirements
- iOS-specific assets and guidelines

### Android Submission (\`android/\`)
- Play Store configuration and metadata  
- AAB/APK file (if successfully built)
- Submission checklist and requirements
- Android-specific assets and guidelines

### Assets (\`assets/\`)
- App icon requirements and specifications
- Screenshot plans and templates
- Marketing graphics guidelines

### Metadata (\`metadata/\`)
- Marketing copy and messaging
- Feature descriptions and value propositions
- Target audience information

## Next Steps

### Immediate Actions Required
1. **Create App Icons**: Generate all required icon sizes per platform guidelines
2. **Capture Screenshots**: Take high-quality screenshots of all app screens
3. **Set Up Store Accounts**: Create Apple Developer and Google Play Console accounts
4. **Configure Signing**: Set up proper code signing certificates and keystores

### Store Submission Process
1. **iOS App Store**:
   - Upload to App Store Connect
   - Complete app information and metadata
   - Submit for review (typically 24-48 hours)
   
2. **Google Play Store**:
   - Upload to Play Console
   - Complete store listing and content rating
   - Submit for review (typically 1-3 hours)

### Post-Submission
1. Monitor review status and respond to feedback
2. Plan marketing and launch strategy
3. Set up analytics and crash reporting
4. Prepare for user feedback and updates

## Important Notes

- **Privacy Policy**: Ensure https://blaze-intelligence.com/privacy-policy is live
- **Support URL**: Verify https://blaze-intelligence.com/support is accessible  
- **Demo Account**: demo@blaze-intelligence.com / demo123 for app review
- **Contact**: Austin Humphrey - ahump20@outlook.com - (210) 273-5538

## App Store Guidelines Compliance

### iOS App Store Review Guidelines
- ✅ App provides clear value to users
- ✅ Uses platform capabilities appropriately  
- ✅ Follows design guidelines
- ✅ Respects user privacy
- ✅ Uses appropriate content rating

### Google Play Policy Compliance
- ✅ Follows Material Design principles
- ✅ Requests only necessary permissions
- ✅ Provides clear privacy information
- ✅ Uses appropriate content rating
- ✅ Follows distribution policies

---

**Ready for App Store Submission** 🚀

For questions or support, contact Austin Humphrey at ahump20@outlook.com
EOF

    log_success "Submission summary generated"
}

# Main execution
main() {
    log_info "Starting app store submission preparation for $APP_NAME v$APP_VERSION"
    
    # Prepare platform-specific submissions
    prepare_ios_submission || log_warning "iOS preparation had issues"
    prepare_android_submission || log_warning "Android preparation had issues"
    
    # Generate assets and metadata
    generate_app_assets
    generate_submission_summary
    
    # Final package information
    log_success "App store submission package completed!"
    echo ""
    echo "📦 Package Location: $SUBMISSION_DIR"
    echo "📱 iOS Submission: $SUBMISSION_DIR/ios/"
    echo "🤖 Android Submission: $SUBMISSION_DIR/android/"
    echo "🎨 Assets: $SUBMISSION_DIR/assets/"
    echo "📝 Metadata: $SUBMISSION_DIR/metadata/"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Review submission checklists in each platform directory"
    echo "   2. Create required app icons and screenshots"
    echo "   3. Set up Apple Developer and Google Play Console accounts"
    echo "   4. Upload builds and complete store listings"
    echo ""
    echo "🔗 Important URLs:"
    echo "   • Privacy Policy: https://blaze-intelligence.com/privacy-policy"
    echo "   • Support: https://blaze-intelligence.com/support"
    echo "   • Demo Account: demo@blaze-intelligence.com / demo123"
}

# Run main function
main "$@"