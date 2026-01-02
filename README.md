# sturdy-funicular

## Advanced Git Commands Guide

This guide covers advanced Git commands that are essential for effective version control management. Each command includes detailed explanations and practical examples.

---

## Table of Contents

1. [git stash](#git-stash)
2. [git cherry-pick](#git-cherry-pick)
3. [git revert](#git-revert)
4. [git reset](#git-reset)

---

## git stash

The `git stash` command temporarily stores modified tracked files and staged changes, allowing you to switch branches or pull updates without committing incomplete work.

### Common Usage

**Basic stash:**
```bash
git stash
```
Saves your current changes and reverts to a clean working directory.

**Stash with a descriptive message:**
```bash
git stash push -m "WIP: implementing user authentication"
```
Note: `git stash save` is deprecated as of Git 2.16; use `git stash push -m` instead.

**List all stashes:**
```bash
git stash list
```
Output example:
```
stash@{0}: WIP: implementing user authentication
stash@{1}: On main: bug fix for login
```

**Apply the most recent stash:**
```bash
git stash apply
```

**Apply a specific stash:**
```bash
git stash apply stash@{1}
```

**Apply and remove the most recent stash:**
```bash
git stash pop
```

**Stash untracked files:**
```bash
git stash -u
```

**Stash including ignored files:**
```bash
git stash -a
```

**Create a branch from a stash:**
```bash
git stash branch feature-branch stash@{0}
```

**Drop a specific stash:**
```bash
git stash drop stash@{0}
```

**Clear all stashes:**
```bash
git stash clear
```

### Example Scenario

```bash
# You're working on a feature
git status
# Changes not staged for commit:
#   modified:   src/auth.js

# Urgent bug fix needed on main branch
git stash push -m "WIP: authentication feature"

# Switch to main and fix the bug
git checkout main
# ... make fixes ...
git commit -am "Fix critical bug"

# Return to your feature work
git checkout feature-branch
git stash pop
```

---

## git cherry-pick

The `git cherry-pick` command allows you to select specific commits from one branch and apply them to another branch. This is useful when you need specific changes without merging entire branches.

### Common Usage

**Cherry-pick a single commit:**
```bash
git cherry-pick <commit-hash>
```

**Cherry-pick multiple commits:**
```bash
git cherry-pick <commit-hash-1> <commit-hash-2>
```

**Cherry-pick a range of commits (inclusive):**
```bash
git cherry-pick <start-commit-hash>^..<end-commit-hash>
```
Note: To include all commits from A to B, use `A^..B`. This starts from the parent of A (denoted by `^`), making commit A the first in the range, through to B. Using `A..B` alone would skip commit A and only cherry-pick commits after A up to B.

**Cherry-pick without committing (stage only):**
```bash
git cherry-pick --no-commit <commit-hash>
```
or
```bash
git cherry-pick -n <commit-hash>
```

**Cherry-pick and edit the commit message:**
```bash
git cherry-pick --edit <commit-hash>
```

**Continue after resolving conflicts:**
```bash
git cherry-pick --continue
```

**Abort cherry-pick:**
```bash
git cherry-pick --abort
```

### Example Scenario

```bash
# View commits on another branch
git log feature-branch --oneline
# abc1234 Add password validation
# def5678 Update user model
# ghi9012 Fix typo in comments

# Cherry-pick the password validation commit to your current branch
git cherry-pick abc1234

# Cherry-pick multiple specific commits
git cherry-pick abc1234 ghi9012

# Cherry-pick with conflict resolution
git cherry-pick def5678
# CONFLICT (content): Merge conflict in src/user.js
# Resolve conflicts manually
git add src/user.js
git cherry-pick --continue
```

### Use Cases

- Backporting bug fixes to release branches
- Applying hotfixes to multiple branches
- Selectively merging commits without pulling entire branches
- Recovering commits from deleted branches

---

## git revert

The `git revert` command creates a new commit that undoes the changes from a previous commit, preserving the project history. This is the safest way to undo changes that have been shared with others.

### Common Usage

**Revert the most recent commit:**
```bash
git revert HEAD
```

**Revert a specific commit:**
```bash
git revert <commit-hash>
```

**Revert multiple commits:**
```bash
git revert <commit-hash-1> <commit-hash-2>
```

**Revert a range of commits (inclusive):**
```bash
git revert <start-commit-hash>^..<end-commit-hash>
```
Note: To include all commits from A to B, use `A^..B`. This starts from the parent of A (denoted by `^`), making commit A the first in the range, through to B. Using `A..B` alone would skip commit A and only revert commits after A up to B.

**Revert without committing immediately:**
```bash
git revert --no-commit <commit-hash>
```
or
```bash
git revert -n <commit-hash>
```

**Revert and edit the commit message:**
```bash
git revert --edit <commit-hash>
```

**Continue after resolving conflicts:**
```bash
git revert --continue
```

**Abort revert:**
```bash
git revert --abort
```

**Revert a merge commit:**
```bash
git revert -m 1 <merge-commit-hash>
```
The `-m 1` specifies which parent to consider as the mainline (usually 1 for the branch you merged into).

### Example Scenario

```bash
# View recent commits
git log --oneline
# abc1234 (HEAD) Add new feature
# def5678 Update documentation
# ghi9012 Refactor authentication

# The new feature introduced a bug, revert it
git revert abc1234
# This creates a new commit that undoes abc1234

# Revert multiple commits without auto-committing
git revert -n def5678 abc1234
git commit -m "Revert recent changes due to integration issues"

# Revert a merge commit (suppose ghi9012 was a merge)
git log --merges
git revert -m 1 ghi9012
```

### When to Use git revert

- Changes have been pushed to a shared branch
- You want to maintain a clear history of what was undone
- You need to undo changes on a public branch safely
- Reverting changes in a collaborative environment

---

## git reset

The `git reset` command moves the current branch pointer to a specified commit, optionally modifying the staging area and working directory. It's powerful but should be used carefully, especially with shared branches.

### Reset Modes

#### 1. Soft Reset (`--soft`)
Moves HEAD to the specified commit, but keeps changes in the staging area and working directory.

```bash
git reset --soft <commit-hash>
```

#### 2. Mixed Reset (`--mixed`) - Default
Moves HEAD to the specified commit and unstages changes, but keeps them in the working directory.

```bash
git reset <commit-hash>
# or explicitly
git reset --mixed <commit-hash>
```

#### 3. Hard Reset (`--hard`)
Moves HEAD to the specified commit and discards all changes in the staging area and working directory.

```bash
git reset --hard <commit-hash>
```

### Common Usage

**Undo the last commit, keeping changes staged:**
```bash
git reset --soft HEAD~1
```

**Undo the last commit, keeping changes unstaged:**
```bash
git reset HEAD~1
```

**Undo the last commit and discard all changes:**
```bash
git reset --hard HEAD~1
```

**Reset to a specific commit:**
```bash
git reset --hard abc1234
```

**Unstage a file:**
```bash
git reset HEAD <file>
```

**Reset to remote branch state:**
```bash
git reset --hard origin/main
```

**Undo multiple commits:**
```bash
git reset --soft HEAD~3
```
This undoes the last 3 commits but keeps all changes staged.

### Example Scenarios

**Scenario 1: Undo last commit but keep changes**
```bash
# Made a commit too early
git log --oneline
# abc1234 (HEAD) Incomplete feature
# def5678 Previous commit

# Undo the commit but keep the work
git reset --soft HEAD~1
# Now changes are staged and ready to be modified/recommitted
git status
# Changes to be committed:
#   modified:   src/feature.js
```

**Scenario 2: Completely undo uncommitted changes**
```bash
# Working directory is messy with unwanted changes
git status
# Changes not staged for commit:
#   modified:   file1.js
#   modified:   file2.js

# Discard all changes
git reset --hard HEAD
# Working directory is now clean
```

**Scenario 3: Split a large commit into smaller ones**
```bash
# Last commit has too many unrelated changes
git reset --soft HEAD~1

# Now changes are staged, unstage them
git reset

# Stage and commit changes incrementally
git add src/auth.js
git commit -m "Add authentication logic"

git add src/validation.js
git commit -m "Add input validation"
```

**Scenario 4: Sync with remote branch**
```bash
# Local branch has diverged from remote
git fetch origin
git reset --hard origin/main
# Local main now matches remote main exactly
```

### Reset vs Revert

| **Aspect** | `git reset` | `git revert` |
|------------|-------------|--------------|
| **History** | Rewrites history | Preserves history |
| **Safety** | Dangerous for shared branches | Safe for shared branches |
| **Use Case** | Local commits not pushed yet | Published commits |
| **Result** | Moves branch pointer | Creates new commit |
| **Collaboration** | Avoid on shared branches | Safe for collaboration |

### ⚠️ Warning

**Be extremely careful with `git reset --hard` on shared branches.** It rewrites history and can cause issues for other collaborators. Use `git revert` instead for commits that have been pushed to shared branches.

---

## Summary

- **`git stash`**: Temporarily save work in progress without committing
- **`git cherry-pick`**: Apply specific commits from one branch to another
- **`git revert`**: Safely undo commits by creating new commits (safe for shared branches)
- **`git reset`**: Move branch pointer and modify staging/working directory (use carefully)

### Quick Reference

```bash
# Stash current work
git stash
git stash pop

# Apply specific commit to current branch
git cherry-pick <commit-hash>

# Safely undo a commit (for shared branches)
git revert <commit-hash>

# Undo last commit, keep changes (for local work)
git reset --soft HEAD~1

# Undo last commit and discard changes
git reset --hard HEAD~1
```

---

## Best Practices

1. **Use `git stash`** when you need to quickly switch context without losing work
2. **Use `git cherry-pick`** sparingly and document why specific commits were cherry-picked
3. **Use `git revert`** for undoing changes on shared/public branches
4. **Use `git reset`** only on local commits that haven't been pushed
5. **Always verify** your working directory state before and after using these commands
6. **Create backups** before using destructive commands like `git reset --hard`

---

For more information, consult the [official Git documentation](https://git-scm.com/doc).