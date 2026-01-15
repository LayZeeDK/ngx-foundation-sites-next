# Ignore Patterns by Technology

Standard ignore file patterns organized by technology stack.

## Setup Verification Logic

### Detection & Creation

1. Check if repository is git repo → create/verify `.gitignore`

   ```bash
   git rev-parse --git-dir 2>/dev/null
   ```

2. Check if `Dockerfile*` exists or Docker in plan.md → create/verify `.dockerignore`
3. Check if `.eslintrc*` exists → create/verify `.eslintignore`
4. Check if `eslint.config.*` exists → ensure config's `ignores` entries cover patterns
5. Check if `.prettierrc*` exists → create/verify `.prettierignore`
6. Check if `.npmrc` or `package.json` exists → create/verify `.npmignore` (if publishing)
7. Check if terraform files (`*.tf`) exist → create/verify `.terraformignore`
8. Check if helm charts present (`Chart.yaml`) → create/verify `.helmignore`

### File Handling Rules

- **If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only
- **If ignore file missing**: Create with full pattern set for detected technology

---

## Language-Specific Patterns

### Node.js / JavaScript / TypeScript

```gitignore
node_modules/
dist/
build/
*.log
.env*
coverage/
.nyc_output/
```

### Python

```gitignore
__pycache__/
*.pyc
.venv/
venv/
dist/
*.egg-info/
.pytest_cache/
.mypy_cache/
```

### Java

```gitignore
target/
*.class
*.jar
.gradle/
build/
.idea/
*.iml
```

### C# / .NET

```gitignore
bin/
obj/
*.user
*.suo
packages/
.vs/
```

### Go

```gitignore
*.exe
*.test
vendor/
*.out
go.sum
```

### Ruby

```gitignore
.bundle/
log/
tmp/
*.gem
vendor/bundle/
```

### PHP

```gitignore
vendor/
*.log
*.cache
*.env
```

### Rust

```gitignore
target/
debug/
release/
*.rs.bk
*.rlib
*.prof*
Cargo.lock
```

### Kotlin

```gitignore
build/
out/
.gradle/
.idea/
*.class
*.jar
*.iml
```

### C++

```gitignore
build/
bin/
obj/
out/
*.o
*.so
*.a
*.exe
*.dll
CMakeCache.txt
CMakeFiles/
```

### C

```gitignore
build/
bin/
obj/
out/
*.o
*.a
*.so
*.exe
config.log
```

### Swift

```gitignore
.build/
DerivedData/
*.swiftpm/
Packages/
.swiftpm/
```

### R

```gitignore
.Rproj.user/
.Rhistory
.RData
.Ruserdata
*.Rproj
packrat/
renv/
```

---

## Universal Patterns

Always include these regardless of technology:

```gitignore
# OS generated
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.swp
*.swo
*~

# IDE/Editor
.vscode/
.idea/
*.sublime-*

# Logs
*.log
logs/

# Environment
.env
.env.*
!.env.example
```

---

## Tool-Specific Patterns

### Docker (.dockerignore)

```dockerignore
node_modules/
.git/
.gitignore
Dockerfile*
.dockerignore
*.log*
.env*
coverage/
.nyc_output/
.cache/
dist/
```

### ESLint (.eslintignore)

```eslintignore
node_modules/
dist/
build/
coverage/
*.min.js
*.bundle.js
```

### Prettier (.prettierignore)

```prettierignore
node_modules/
dist/
build/
coverage/
package-lock.json
yarn.lock
pnpm-lock.yaml
*.min.js
*.min.css
```

### Terraform (.terraformignore)

```terraformignore
.terraform/
*.tfstate*
*.tfvars
.terraform.lock.hcl
crash.log
```

### Kubernetes / k8s

```gitignore
*.secret.yaml
secrets/
.kube/
kubeconfig*
*.key
*.crt
*.pem
```

### Helm (.helmignore)

```helmignore
.git/
.gitignore
.helmignore
.idea/
*.orig
```

---

## Usage in Commands

When setting up a project, apply patterns based on detected technology:

```typescript
// Pseudo-code for pattern application
const detectedTech = detectTechnologyStack(projectDir);
const patterns = [];

for (const tech of detectedTech) {
  patterns.push(...PATTERNS[tech]);
}
patterns.push(...UNIVERSAL_PATTERNS);

createOrUpdateIgnoreFile('.gitignore', patterns);
```
