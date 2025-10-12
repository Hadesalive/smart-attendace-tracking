#!/usr/bin/env tsx

// Test runner script for comprehensive testing

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface TestResult {
  testFile: string
  passed: number
  failed: number
  total: number
  duration: number
  coverage?: {
    statements: number
    branches: number
    functions: number
    lines: number
  }
}

interface TestSummary {
  totalTests: number
  passedTests: number
  failedTests: number
  totalDuration: number
  coverage: {
    statements: number
    branches: number
    functions: number
    lines: number
  }
  results: TestResult[]
}

// ============================================================================
// TEST RUNNER UTILITIES
// ============================================================================

class TestRunner {
  private results: TestResult[] = []
  private startTime: number = Date.now()
  private coverage: {
    statements: number
    branches: number
    functions: number
    lines: number
  } | null = null

  async runAllTests(): Promise<TestSummary> {
    console.log('🚀 Starting comprehensive test suite...\n')

    try {
      // Run unit tests
      await this.runTestCategory('Unit Tests', [
        'tests/validation.test.ts',
        'tests/edge-cases.test.ts'
      ])

      // Run integration tests
      await this.runTestCategory('Integration Tests', [
        'tests/attendance-workflow.test.ts'
      ])

      // Run database tests
      await this.runTestCategory('Database Tests', [
        'tests/database-triggers.test.ts'
      ])

      // Generate coverage report
      await this.generateCoverageReport()

      // Calculate summary
      const summary = this.calculateSummary()

      this.displayResults(summary)

      return summary

    } catch (error) {
      console.error('❌ Test execution failed:', error)
      throw error
    }
  }

  private async runTestCategory(categoryName: string, testFiles: string[]): Promise<void> {
    console.log(`📋 Running ${categoryName}...`)

    for (const testFile of testFiles) {
      const result = await this.runSingleTestFile(testFile)
      this.results.push(result)
    }

    console.log(`✅ ${categoryName} completed\n`)
  }

  private async runSingleTestFile(testFile: string): Promise<TestResult> {
    const startTime = Date.now()

    try {
      console.log(`  🧪 Running ${path.basename(testFile)}...`)

      // Run Jest for this specific test file
      const output = execSync(`npx jest ${testFile} --json --outputFile=/tmp/jest-result.json`, {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      // Parse Jest results
      const jestResult = JSON.parse(fs.readFileSync('/tmp/jest-result.json', 'utf8'))

      const duration = Date.now() - startTime
      const passed = jestResult.numPassedTests || 0
      const failed = jestResult.numFailedTests || 0
      const total = jestResult.numTotalTests || 0

      return {
        testFile,
        passed,
        failed,
        total,
        duration
      }

    } catch (error: any) {
      console.error(`  ❌ Failed to run ${testFile}:`, error.message)

      return {
        testFile,
        passed: 0,
        failed: 1,
        total: 0,
        duration: Date.now() - startTime
      }
    }
  }

  private async generateCoverageReport(): Promise<void> {
    console.log('📊 Generating coverage report...')

    try {
      execSync('npx jest --coverage --coverageReporters=json --outputFile=/tmp/coverage.json', {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      const coverageData = JSON.parse(fs.readFileSync('/tmp/coverage.json', 'utf8'))

      // Extract overall coverage percentages
      if (coverageData.total) {
        this.coverage = {
          statements: Math.round(coverageData.total.statements.pct),
          branches: Math.round(coverageData.total.branches.pct),
          functions: Math.round(coverageData.total.functions.pct),
          lines: Math.round(coverageData.total.lines.pct)
        }
      }

    } catch (error) {
      console.warn('⚠️ Could not generate coverage report:', error)
    }
  }

  private calculateSummary(): TestSummary {
    const totalTests = this.results.reduce((sum, r) => sum + r.total, 0)
    const passedTests = this.results.reduce((sum, r) => sum + r.passed, 0)
    const failedTests = this.results.reduce((sum, r) => sum + r.failed, 0)
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)

    return {
      totalTests,
      passedTests,
      failedTests,
      totalDuration,
      coverage: this.coverage || { statements: 0, branches: 0, functions: 0, lines: 0 },
      results: this.results
    }
  }

  private displayResults(summary: TestSummary): void {
    console.log('\n' + '='.repeat(60))
    console.log('🧪 TEST RESULTS SUMMARY')
    console.log('='.repeat(60))

    // Overall stats
    console.log(`📊 Total Tests: ${summary.totalTests}`)
    console.log(`✅ Passed: ${summary.passedTests}`)
    console.log(`❌ Failed: ${summary.failedTests}`)
    console.log(`⏱️  Duration: ${Math.round(summary.totalDuration / 1000)}s`)

    // Coverage
    if (summary.coverage.statements > 0) {
      console.log('\n📈 Code Coverage:')
      console.log(`  Statements: ${summary.coverage.statements}%`)
      console.log(`  Branches: ${summary.coverage.branches}%`)
      console.log(`  Functions: ${summary.coverage.functions}%`)
      console.log(`  Lines: ${summary.coverage.lines}%`)
    }

    // Detailed results
    console.log('\n📋 Detailed Results:')
    this.results.forEach(result => {
      const status = result.failed > 0 ? '❌' : '✅'
      console.log(`  ${status} ${path.basename(result.testFile)}: ${result.passed}/${result.total} tests (${Math.round(result.duration)}ms)`)
    })

    // Final assessment
    console.log('\n' + '='.repeat(60))
    if (summary.failedTests === 0) {
      console.log('🎉 ALL TESTS PASSED! System is ready for production.')
    } else {
      console.log(`⚠️  ${summary.failedTests} tests failed. Please review and fix before deployment.`)
    }
    console.log('='.repeat(60))
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const testRunner = new TestRunner()

  try {
    const summary = await testRunner.runAllTests()

    // Exit with appropriate code
    process.exit(summary.failedTests > 0 ? 1 : 0)

  } catch (error) {
    console.error('💥 Test runner failed:', error)
    process.exit(1)
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  main()
}

export { TestRunner }
