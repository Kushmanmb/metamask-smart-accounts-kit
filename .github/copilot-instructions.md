# Copilot Instructions for MetaMask Smart Accounts Kit Demo

## Project Overview
This is a demonstration project for the MetaMask Smart Accounts Kit, focusing on integrating MetaMask with smart account functionality.

## Code Style and Conventions
- Use modern JavaScript (ES6+) syntax
- Follow consistent naming conventions (camelCase for variables and functions, PascalCase for classes)
- Add clear, concise comments for complex logic
- Use meaningful variable and function names that describe their purpose

## Dependencies
- This project uses `@metamask/smart-accounts-kit` as its main dependency
- Use Yarn as the package manager (a `yarn.lock` file is present)
- When adding new dependencies, use `yarn add <package-name>`
- Check for security vulnerabilities in dependencies before adding them

## Best Practices
- Write clear commit messages that describe what changed and why
- Keep changes focused and minimal
- Test any code changes that affect core functionality
- Document any new features or significant changes in the README
- Follow security best practices when handling user data or blockchain interactions

## MetaMask and Web3 Specific Guidelines
- Handle wallet connection states gracefully
- Provide clear error messages for wallet-related issues
- Never expose private keys or sensitive data in code
- Follow MetaMask's best practices for dApp development
- Consider gas optimization when working with smart contracts

## Testing
- Add tests for new functionality when appropriate
- Ensure existing tests pass before submitting changes
- Test wallet integration manually when making wallet-related changes

## Documentation
- Update README.md when adding new features or changing setup instructions
- Include code examples for complex functionality
- Document any required environment variables or configuration

## Security
- Never commit API keys, private keys, or other secrets
- Validate and sanitize user inputs
- Follow secure coding practices for Web3 applications
- Be cautious with external dependencies and their permissions
