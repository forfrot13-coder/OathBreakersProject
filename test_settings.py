#!/usr/bin/env python
"""
Test script to verify settings.py configuration for development and production modes.
"""
import os
import sys
import subprocess

def run_test(description, env_vars, should_succeed):
    """Run a Django check with specific environment variables."""
    print(f"\n{'='*70}")
    print(f"TEST: {description}")
    print(f"{'='*70}")
    
    env = os.environ.copy()
    env.update(env_vars)
    
    # Show environment variables being set
    if env_vars:
        print("Environment variables:")
        for key, value in env_vars.items():
            print(f"  {key}={value}")
    else:
        print("No environment variables set (using defaults)")
    
    result = subprocess.run(
        [sys.executable, 'manage.py', 'check', '--verbosity', '0'],
        env=env,
        capture_output=True,
        text=True
    )
    
    if should_succeed:
        if result.returncode == 0:
            print("✅ PASSED: Command succeeded as expected")
            return True
        else:
            print("❌ FAILED: Command should have succeeded but failed")
            print(f"Error: {result.stderr}")
            return False
    else:
        if result.returncode != 0:
            print("✅ PASSED: Command failed as expected")
            error_msg = result.stderr
            if "DJANGO_SECRET_KEY" in error_msg:
                print("   Reason: Missing DJANGO_SECRET_KEY")
            elif "POSTGRES_PASSWORD" in error_msg:
                print("   Reason: Missing POSTGRES_PASSWORD")
            return True
        else:
            print("❌ FAILED: Command should have failed but succeeded")
            return False

def main():
    """Run all tests."""
    print("="*70)
    print("Settings.py Configuration Tests")
    print("="*70)
    
    tests = [
        # Test 1: Development mode (no env vars)
        (
            "Development mode - No environment variables",
            {},
            True
        ),
        
        # Test 2: Development mode (with env vars)
        (
            "Development mode - Custom environment variables",
            {
                'ENVIRONMENT': 'development',
                'DJANGO_SECRET_KEY': 'custom-dev-key-12345',
                'POSTGRES_PASSWORD': 'custom-password'
            },
            True
        ),
        
        # Test 3: Production mode - Missing SECRET_KEY
        (
            "Production mode - Missing DJANGO_SECRET_KEY (should fail)",
            {
                'ENVIRONMENT': 'production'
            },
            False
        ),
        
        # Test 4: Production mode - Missing POSTGRES_PASSWORD
        (
            "Production mode - Missing POSTGRES_PASSWORD (should fail)",
            {
                'ENVIRONMENT': 'production',
                'DJANGO_SECRET_KEY': 'prod-secret-key-12345'
            },
            False
        ),
        
        # Test 5: Production mode - All required vars present
        (
            "Production mode - All required variables present",
            {
                'ENVIRONMENT': 'production',
                'DJANGO_SECRET_KEY': 'prod-secret-key-12345',
                'POSTGRES_PASSWORD': 'prod-db-password'
            },
            True
        ),
    ]
    
    results = []
    for description, env_vars, should_succeed in tests:
        passed = run_test(description, env_vars, should_succeed)
        results.append((description, passed))
    
    # Summary
    print(f"\n{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    
    for description, passed_test in results:
        status = "✅ PASSED" if passed_test else "❌ FAILED"
        print(f"{status}: {description}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n❌ {total - passed} test(s) failed")
        return 1

if __name__ == '__main__':
    sys.exit(main())
