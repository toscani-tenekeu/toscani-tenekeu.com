# toscani-tenekeu.com

Source code for [toscani-tenekeu.com](https://toscani-tenekeu.com), a developer resource hub with articles, tutorials, books, videos, projects and a private content administration interface.

## Stack

- Vue 3, TypeScript, Vite and Tailwind CSS
- Express 5, SQLite and `better-sqlite3`

## Local development

```bash
npm install
cp server/.env.example server/.env
npm run db:init
npm run dev
```

Replace every placeholder in `server/.env` before signing in to the administration interface.

## Validation

```bash
npm run lint
npm run type-check
npm test
npm run build
```

## Deployment

From the VPS account with working GitHub SSH access:

```bash
sudo install -d -o "$USER" -g "$(id -gn)" /opt/toscani-tenekeu.com
git clone git@github.com:toscani-tenekeu/toscani-tenekeu.com.git /opt/toscani-tenekeu.com

sudo DEPLOY_USER="$USER" \
  bash /opt/toscani-tenekeu.com/deploy/vps-deploy.sh --install-timer
```

The script securely prompts for the administrator password and completes the deployment.

## License

MIT
