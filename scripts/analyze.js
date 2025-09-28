#!/usr/bin/env node

/**
 * Usage Analysis Tool for Jumi Animation Plugin
 *
 * This script analyzes:
 * 1. Which jumi animation utilities are used in HTML files
 * 2. Which keyframes are generated in the output CSS
 * 3. The gap between generated and used keyframes
 * 4. Recommendations for optimization
 */

import { glob } from 'glob'

import fs from 'fs'

function analyzeUsage() {
  console.log('🔍 Analyzing Jumi Animation Usage...\n')

  // 1. Find all HTML files
  const htmlFiles = glob.sync('examples/**/*.html')

  // 2. Extract all jumi utilities from HTML
  const usedUtilities = new Set()
  const jumiUtilityPattern = /\b(?:animate(?:-[\w-]+)?)\b/g

  htmlFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8')
    const matches = content.match(jumiUtilityPattern) || []
    matches.forEach(match => usedUtilities.add(match))
  })

  // 3. Analyze generated keyframes
  const outputCSS = fs.readFileSync('examples/output.css', 'utf8')
  const generatedKeyframes = new Set()
  const keyframePattern = /@keyframes\s+(jumi-[\w-]+)/g

  let match
  while ((match = keyframePattern.exec(outputCSS)) !== null) {
    generatedKeyframes.add(match[1])
  }

  // 4. Analyze @property declarations
  const generatedProperties = new Set()
  const propertyPattern = /@property\s+(--jumi-[\w-]+)/g

  while ((match = propertyPattern.exec(outputCSS)) !== null) {
    generatedProperties.add(match[1])
  }

  // 5. Calculate file stats
  const stats = fs.statSync('examples/output.css')
  const fileSizeKB = Math.round(stats.size / 1024)
  const totalLines = outputCSS.split('\n').length

  // 6. Generate report
  console.log('📊 USAGE ANALYSIS REPORT')
  console.log('========================\n')

  console.log('📁 FILE STATISTICS:')
  console.log(`   Size: ${fileSizeKB}KB`)
  console.log(`   Lines: ${totalLines.toLocaleString()}`)
  console.log(`   HTML files analyzed: ${htmlFiles.length}\n`)

  console.log('🎯 UTILITY USAGE:')
  console.log(`   Unique utilities used: ${usedUtilities.size}`)
  console.log('   Used utilities:')
  Array.from(usedUtilities).sort().forEach((utility) => {
    console.log(`     - ${utility}`)
  })
  console.log()

  console.log('🎨 GENERATED KEYFRAMES:')
  console.log(`   Total keyframes: ${generatedKeyframes.size}`)
  console.log(`   Total @property declarations: ${generatedProperties.size}`)
  console.log()

  // 7. Map utilities to expected keyframes
  const expectedKeyframes = new Set()
  usedUtilities.forEach((utility) => {
    if (utility === 'animate') {
      // This would need specific values, but we can't determine them from class names alone
      console.log('⚠️  Found generic "animate" utility - specific keyframes depend on values used')
    }
    else if (utility.startsWith('animate-')) {
      const property = utility.replace('animate-', '')
      expectedKeyframes.add(`jumi-${property}`)
    }
  })

  console.log('❓ USAGE ANALYSIS:')
  console.log(`   Expected keyframes based on utilities: ${expectedKeyframes.size}`)
  console.log(`   Actually generated keyframes: ${generatedKeyframes.size}`)
  console.log(`   Over-generation: ${generatedKeyframes.size - expectedKeyframes.size} keyframes`)
  console.log(`   Over-generation percentage: ${Math.round(((generatedKeyframes.size - expectedKeyframes.size) / generatedKeyframes.size) * 100)}%`)
  console.log()

  console.log('💡 OPTIMIZATION RECOMMENDATIONS:')
  console.log('   1. The plugin generates ALL keyframes regardless of usage')
  console.log('   2. Consider implementing JIT generation for keyframes')
  console.log('   3. Use Tailwind\'s purging to remove unused keyframes')
  console.log('   4. Consider splitting keyframes into separate files for lazy loading')
  console.log()

  console.log('🔧 POTENTIAL SAVINGS:')
  const unusedKeyframes = generatedKeyframes.size - expectedKeyframes.size
  const avgKeyframeSizeLines = 8 // estimated lines per keyframe
  const potentialSavedLines = unusedKeyframes * avgKeyframeSizeLines
  const potentialSavedKB = Math.round((potentialSavedLines / totalLines) * fileSizeKB)
  console.log(`   Unused keyframes: ~${unusedKeyframes}`)
  console.log(`   Potential saved lines: ~${potentialSavedLines.toLocaleString()}`)
  console.log(`   Potential saved size: ~${potentialSavedKB}KB`)
  console.log()
}

// Check if running directly (ES module equivalent)
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    analyzeUsage()
  }
  catch (error) {
    console.error('❌ Error analyzing usage:', error.message)
    process.exit(1)
  }
}

export { analyzeUsage }
