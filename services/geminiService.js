const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateContent = async (prompt) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are Devdoc.ai, an expert AI code intelligence assistant. Your purpose is to analyze code, technical project structures, stack traces, and software engineering documentation. \n\nCRITICAL RULE: If the user provides input that is NOT code, project structure, a stack trace, or related to technical software engineering (e.g., greetings like 'hello', 'good morning', off-topic questions, or general conversation), you MUST respond exactly with: 'No valid code or technical input provided. Please paste code, an error, or a repository structure for analysis.' Do not provide any other feedback or greeting."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error details:', error);
    throw error;
  }
};

const prompts = {
  'code-review': (code) => `
You are an expert senior software engineer performing a detailed code review.
Analyze the following code and provide structured feedback:

\`\`\`
${code}
\`\`\`

Return your analysis in this exact format:

## 📋 Code Review Summary

### ✅ What's Good
- List positive aspects of the code

### ⚠️ Readability Issues
- List readability problems with line references where possible

### 🔧 Best Practice Violations
- List deviations from best practices

### 💡 Improvement Suggestions
- Specific, actionable suggestions with code examples

### 📊 Scores (out of 10)
- Readability: X/10
- Maintainability: X/10
- Code Style: X/10
- Overall: X/10

Be specific, professional, and educational.
`,

  'bug-detect': (code) => `
You are an expert debugger and QA engineer. Analyze this code for bugs:

\`\`\`
${code}
\`\`\`

Return your analysis in this exact format:

## 🐛 Bug Detection Report

### 🔴 Critical Bugs
- Describe each critical bug, its location, why it's a problem, and the fix

### 🟠 Logical Errors
- Describe logical errors that might cause incorrect behavior

### 🟡 Runtime Error Risks
- operations that could throw exceptions or crash at runtime

### 🟢 Potential Issues
- Minor issues or code smells to watch out for

### ✅ Fixed Code
Provide the corrected version of the code with comments explaining each fix.

### 📊 Bug Severity Score
- Total bugs found: X
- Risk Level: Low/Medium/High/Critical
`,

  'security-scan': (code) => `
You are a cybersecurity expert and penetration tester. Perform a security audit:

\`\`\`
${code}
\`\`\`

Return your analysis in this exact format:

## 🔒 Security Audit Report

### 🚨 Critical Vulnerabilities
- CVE-like descriptions of critical security holes

### ⚠️ High Risk Issues
- SQL injection, XSS, CSRF risks, etc.

### 🔐 Unsafe Patterns
- Hardcoded secrets, weak cryptography, insecure randomness

### 📦 Dependency Risks
- Any unsafe library usage patterns

### 🛡️ Security Recommendations
- Step-by-step fixes with secure code examples

### 📊 Security Score
- OWASP Compliance: X/10
- Overall Security: X/10
- Risk Level: Low/Medium/High/Critical
`,

  'performance': (code) => `
You are a performance engineering expert. Analyze this code for performance:

\`\`\`
${code}
\`\`\`

Return your analysis in this exact format:

## ⚡ Performance Analysis Report

### 🐌 Slow Operations
- Identify O(n²) or worse algorithms, blocking operations, synchronous I/O

### 🔄 Inefficient Loops
- Nested loops, unnecessary iterations, missing early exits

### 💾 Memory Issues
- Memory leaks, excessive allocations, large object retention

### 🚀 Optimization Suggestions
- Specific refactors with expected performance gain

### ✅ Optimized Code
Provide optimized version of critical sections.

### 📊 Performance Score
- Time Complexity: X/10
- Space Complexity: X/10
- Overall Performance: X/10
`,

  'code-quality': (code) => `
You are a code quality specialist. Assess this code comprehensively:

\`\`\`
${code}
\`\`\`

Return your analysis in this exact format:

## 📈 Code Quality Report

### 📖 Readability Analysis
- Naming conventions, comments quality, code clarity

### 🔧 Maintainability Analysis
- SOLID principles, DRY violations, coupling issues

### 🧩 Complexity Analysis
- Cyclomatic complexity, function length, nesting depth

### 🏗️ Structure Analysis
- Module organization, separation of concerns

### 💡 Refactoring Suggestions
- Concrete steps to improve quality

### 📊 Quality Scores (out of 100)
- Readability: XX/100
- Maintainability: XX/100
- Complexity: XX/100 (lower complexity = higher score)
- Overall Quality: XX/100
`,

  'architecture': (structure) => `
You are a software architect with 15+ years of experience. Analyze this project structure:

${structure}

Return your analysis in this exact format:

## 🏛️ Architecture Analysis Report

### 📁 Folder Structure Assessment
- Is the structure logical and organized?
- Missing important directories or files?

### 🧩 Modularity Feedback
- How well are concerns separated?
- Coupling and cohesion evaluation

### 📈 Scalability Assessment
- Can this structure handle growth?
- Bottlenecks and scaling concerns

### 🔄 Dependency Analysis
- Circular dependencies, unclear module boundaries

### 💡 Architecture Recommendations
- Suggested folder restructuring
- Design patterns to adopt

### 📊 Architecture Score
- Modularity: X/10
- Scalability: X/10
- Maintainability: X/10
- Overall Architecture: X/10
`,

  'github-analyze': (repoContent) => `
You are an expert code reviewer analyzing a GitHub repository. Here is the repository content:

${repoContent}

Return your analysis in this exact format:

## 🐙 GitHub Repository Analysis Report

### 📁 Project Structure
- Overview of the codebase organization

### 💻 Code Quality Assessment
- Overall code quality observations

### 🏗️ Architecture Review
- Design patterns used, architectural strengths/weaknesses

### 🐛 Potential Bugs
- Common bug patterns observed

### ⚡ Performance Concerns
- Performance bottlenecks spotted

### 🔒 Security Overview
- Security practices and vulnerabilities

### 💡 Key Recommendations
- Top 5 actionable improvements

### 📊 Repository Scores
- Code Quality: X/10
- Architecture: X/10
- Security: X/10
- Performance: X/10
- Overall: X/10
`,

  'debug': (errorOrTrace) => `
You are an expert debugging assistant. A developer has encountered the following error:

${errorOrTrace}

Return your analysis in this exact format:

## 🔍 Debug Analysis Report

### ❌ Error Explanation
- What exactly went wrong and why in simple terms

### 🔎 Root Cause Analysis
- The underlying cause of this error

### 🛠️ Step-by-Step Fix
1. First step to fix
2. Second step...
(numbered list)

### ✅ Corrected Code Example
Provide a working code example that resolves the error.

### 🛡️ Prevention Tips
- How to prevent this error in the future

### 📚 Related Resources
- Relevant documentation or concepts to learn
`,

  'explain': (code) => `
You are an expert programming teacher explaining code to a developer. Explain this code:

\`\`\`
${code}
\`\`\`

Return your explanation in this exact format:

## 📚 Code Explanation

### 🎯 What This Code Does
- One paragraph summary of the overall purpose

### 🔍 Step-by-Step Breakdown

Go through the code section by section, explaining:
- What each part does
- Why it's written that way
- Any important concepts used

### 🧠 Key Concepts Used
- List and briefly explain the programming concepts, patterns, or language features

### ⚠️ Things to Watch Out For
- Edge cases, gotchas, or limitations

### 💡 Use Cases
- When would you use this code? Real-world examples.

### 🚀 How to Extend It
- Ideas for building on top of this code
`,
};

module.exports = { generateContent, prompts };
