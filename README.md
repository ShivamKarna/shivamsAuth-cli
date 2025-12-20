# shivamsauth-cli 

A basic CLI tool to automate the boring parts of setting up Express authentication. 

> **Project Status:** This is a "construction" phase prototype. It is currently being tested locally and is not yet published to npm.

## What it builds
Running this tool currently generates:
- **Models**: Mongoose User schema with TypeScript interfaces.
- **Controllers**: Logic for login and registration with Bcrypt and JWT.
- **Routes**: Ready-to-use Express routes.
- **Config**: An auto-generated `.env` file.

## Tech Stack
- **Node.js** (npm)
- **TypeScript** (NodeNext configuration)
- **Chalk** (For terminal styling)
- **fs-extra** (For file system management)

## Future Roadmap
- [ ] Add auto-installation of dependencies (`npm install mongoose etc.`)
- [ ] Add support for different folder structures.
- [ ] Add custom schema fields via terminal prompts.
- [ ] Official npm release.

## Disclaimer
This project is currently in a very basic "toy" version. Use it for learning and exploration while the real construction is underway!
