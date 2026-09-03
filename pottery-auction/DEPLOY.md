# Deployment Runbook — tors-bored.com

## Prerequisites

- Hetzner Cloud account
- Domain `tors-bored.com` with DNS managed somewhere you can edit A records
- GitHub repo with this code; Actions enabled

---

## 1. Provision the server

Create a Hetzner Cloud server (CPX21 or larger recommended) and paste the contents
of `cloud-init.yml` into the **User data** field. This installs Docker Engine,
the compose plugin, and creates `/opt/tors-bored`.

After the server boots (allow ~2 min for cloud-init to finish):

```sh
ssh root@<SERVER_IP>
docker --version   # should print Docker version 26+
```

---

## 2. Point DNS

Add an **A record** for `tors-bored.com` → `<SERVER_IP>`.
Add an **A record** for `www.tors-bored.com` → `<SERVER_IP>`.

Caddy requests a Let's Encrypt certificate automatically on first HTTP hit, so DNS
must resolve before you bring Caddy up (or the cert challenge fails).

---

## 3. First deploy on the server

```sh
ssh root@<SERVER_IP>

# Clone the repo
git clone https://github.com/<YOUR_ORG>/tors-bored.git /opt/tors-bored
cd /opt/tors-bored/pottery-auction

# Generate secrets and create .env
POSTGRES_PASSWORD=$(openssl rand -hex 16)
SESSION_SECRET=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 16)

cat > .env <<EOF
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
SESSION_SECRET=$SESSION_SECRET
CRON_SECRET=$CRON_SECRET

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

NEXT_PUBLIC_APP_URL=https://tors-bored.com
EOF

chmod 600 .env

# Build and start all services
docker compose --env-file .env up -d --build
```

Caddy will request TLS certificates from Let's Encrypt automatically.
Check logs with `docker compose logs -f caddy`.

---

## 4. Run database migrations

Once the `postgres` container is healthy and `app` has started, run your
migration tool against the DATABASE_URL. For example with drizzle-kit:

```sh
# From inside the running app container:
docker compose exec app sh -c 'DATABASE_URL="postgres://tors:${POSTGRES_PASSWORD}@postgres:5432/torsbored" npx drizzle-kit migrate'

# Or from the host, pointing at the postgres container's internal socket
# (postgres port is NOT published externally — run via exec):
docker compose exec postgres psql -U tors -d torsbored -f /migrations/001_init.sql
```

Adjust the command to match your actual migration setup.

---

## 5. Set GitHub Actions secrets

In **Settings → Secrets and variables → Actions** add:

| Secret | Value |
|---|---|
| `HETZNER_IP` | Public IPv4 of the server |
| `SSH_PRIVATE_KEY` | Private SSH key with its public half in `/root/.ssh/authorized_keys` on the server |
| `SSH_HOST_FINGERPRINT` | SHA256 fingerprint — get it with `ssh-keyscan <SERVER_IP> \| ssh-keygen -lf -` |

After this, every push to `main` automatically deploys via `.github/workflows/deploy.yml`.

---

## 6. Cron job (auction close-check)

Add to the server's root crontab (`crontab -e`):

```
* * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://tors-bored.com/api/cron/close-check > /dev/null 2>&1
```

Replace `$CRON_SECRET` with the literal value (crontab doesn't expand shell vars
from `.env`). Retrieve it with:

```sh
grep CRON_SECRET /opt/tors-bored/pottery-auction/.env
```

---

## 7. Verify

```sh
curl https://tors-bored.com/healthz   # should return: ok
docker compose ps                      # all services should show "running"
docker compose logs app --tail 50
```

---

## Useful commands

```sh
# View logs
docker compose logs -f app
docker compose logs -f postgres

# Restart a single service
docker compose restart app

# Open a psql shell
docker compose exec postgres psql -U tors -d torsbored

# Force rebuild (e.g. after dependency changes)
docker compose up -d --build

# Prune old images after rebuild
docker image prune -f
```
