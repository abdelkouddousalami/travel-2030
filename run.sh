#!/bin/bash
# ============================================================================
# Travel2030 - Full Stack Launcher
# Uses Java 17 | MySQL | Spring Boot 8085 | Angular 4200
# ============================================================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

BACKEND_PORT=8085
FRONTEND_PORT=4200
FAKESMTP_PORT=2525
FAKESMTP_JAR="$HOME/Downloads/fakeSMTP-latest/fakeSMTP-2.0.jar"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

BACKEND_PID=""
FRONTEND_PID=""
FAKESMTP_PID=""

# ── Force Java 17 ───────────────────────────────────────────────────────────
if [ -d "/usr/lib/jvm/java-17-openjdk-amd64" ]; then
    export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
elif [ -d "/usr/lib/jvm/java-1.17.0-openjdk-amd64" ]; then
    export JAVA_HOME="/usr/lib/jvm/java-1.17.0-openjdk-amd64"
elif [ -d "/usr/lib/jvm/openjdk-17" ]; then
    export JAVA_HOME="/usr/lib/jvm/openjdk-17"
else
    FOUND=$(find /usr/lib/jvm -maxdepth 1 -type d -name "*17*" 2>/dev/null | head -1)
    if [ -n "$FOUND" ]; then
        export JAVA_HOME="$FOUND"
    fi
fi
export PATH="$JAVA_HOME/bin:$PATH"

# ── Cleanup on Ctrl+C ───────────────────────────────────────────────────────
cleanup() {
    echo ""
    echo -e "${YELLOW}Arret en cours...${NC}"
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null && wait "$FRONTEND_PID" 2>/dev/null
    [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null && wait "$BACKEND_PID" 2>/dev/null
    [ -n "$FAKESMTP_PID" ] && kill "$FAKESMTP_PID" 2>/dev/null && wait "$FAKESMTP_PID" 2>/dev/null
    lsof -ti:$BACKEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null
    lsof -ti:$FRONTEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null
    lsof -ti:$FAKESMTP_PORT 2>/dev/null | xargs kill -9 2>/dev/null
    echo -e "${GREEN}Tous les services sont arretes.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# ── Banner ───────────────────────────────────────────────────────────────────
clear
echo -e "${CYAN}${BOLD}"
echo "  ╔════════════════════════════════════════════╗"
echo "  ║       Travel2030 - Full Stack Launcher     ║"
echo "  ╚════════════════════════════════════════════╝"
echo -e "${NC}"

# ── [1] Java 17 ─────────────────────────────────────────────────────────────
echo -e "${BOLD}[1/6] Java 17${NC}"
if [ -z "$JAVA_HOME" ] || [ ! -f "$JAVA_HOME/bin/java" ]; then
    echo -e "${RED}  ERREUR: Java 17 introuvable.${NC}"
    echo "  Installez-le : sudo apt install openjdk-17-jdk"
    exit 1
fi
JAVA_VER=$("$JAVA_HOME/bin/java" -version 2>&1 | head -1 | cut -d'"' -f2)
if [[ "$JAVA_VER" != 17* ]]; then
    echo -e "${RED}  ERREUR: JAVA_HOME pointe vers Java $JAVA_VER, pas 17.${NC}"
    exit 1
fi
echo -e "${GREEN}  OK${NC} - Java $JAVA_VER"

# ── [2] MySQL ────────────────────────────────────────────────────────────────
echo -e "${BOLD}[2/6] MySQL${NC}"
if systemctl is-active --quiet mysql 2>/dev/null; then
    echo -e "${GREEN}  OK${NC} - MySQL actif"
else
    echo -e "${YELLOW}  MySQL arrete. Demarrage...${NC}"
    sudo systemctl start mysql
    sleep 2
    if ! systemctl is-active --quiet mysql 2>/dev/null; then
        echo -e "${RED}  ERREUR: Impossible de demarrer MySQL${NC}"
        exit 1
    fi
    echo -e "${GREEN}  OK${NC} - MySQL demarre"
fi

if mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS travel2030" &>/dev/null; then
    echo -e "${GREEN}  OK${NC} - Base 'travel2030' prete"
else
    echo -e "${RED}  ERREUR: Connexion MySQL echouee (root/root)${NC}"
    exit 1
fi

# ── [3] Node.js ──────────────────────────────────────────────────────────────
echo -e "${BOLD}[3/6] Node.js${NC}"
if ! command -v node &>/dev/null; then
    echo -e "${RED}  ERREUR: Node.js introuvable.${NC}"
    exit 1
fi
echo -e "${GREEN}  OK${NC} - Node $(node -v)"

# ── [4] fakeSMTP ─────────────────────────────────────────────────────────────
echo -e "${BOLD}[4/6] fakeSMTP (port $FAKESMTP_PORT)${NC}"

if lsof -ti:$FAKESMTP_PORT &>/dev/null; then
    echo -e "${GREEN}  OK${NC} - Deja en cours sur le port $FAKESMTP_PORT"
elif [ -f "$FAKESMTP_JAR" ]; then
    "$JAVA_HOME/bin/java" -jar "$FAKESMTP_JAR" -s -p $FAKESMTP_PORT -o "$HOME/Downloads/fakeSMTP-latest/received-emails" > /dev/null 2>&1 &
    FAKESMTP_PID=$!
    sleep 1
    if kill -0 "$FAKESMTP_PID" 2>/dev/null; then
        echo -e "${GREEN}  OK${NC} - fakeSMTP demarre sur le port $FAKESMTP_PORT"
    else
        echo -e "${YELLOW}  WARN: fakeSMTP n'a pas demarre (les emails OTP ne seront pas envoyes)${NC}"
    fi
else
    echo -e "${YELLOW}  WARN: fakeSMTP-2.0.jar introuvable${NC}"
fi

# ── [5] Backend ──────────────────────────────────────────────────────────────
echo -e "${BOLD}[5/6] Backend Spring Boot${NC}"

if lsof -ti:$BACKEND_PORT &>/dev/null; then
    echo -e "${YELLOW}  Port $BACKEND_PORT occupe, arret...${NC}"
    lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null
    sleep 2
fi

cd "$BACKEND_DIR"
echo -e "  Compilation et demarrage..."
mvn spring-boot:run -q > "$PROJECT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

TRIES=0
while [ $TRIES -lt 60 ]; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/actuator/health 2>/dev/null | grep -qE "200|401|403"; then
        echo -e "${GREEN}  OK${NC} - Backend sur ${BOLD}http://localhost:$BACKEND_PORT${NC}"
        break
    fi
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo -e "${RED}  ERREUR: Le backend a plante.${NC}"
        tail -20 "$PROJECT_DIR/backend.log"
        exit 1
    fi
    TRIES=$((TRIES + 1))
    printf "\r  Attente... %ds" "$TRIES"
    sleep 1
done
printf "\r                      \r"

if [ $TRIES -eq 60 ]; then
    echo -e "${RED}  ERREUR: Backend non demarre apres 60s${NC}"
    tail -20 "$PROJECT_DIR/backend.log"
    exit 1
fi

# ── [6] Frontend ─────────────────────────────────────────────────────────────
echo -e "${BOLD}[6/6] Frontend Angular${NC}"

if lsof -ti:$FRONTEND_PORT &>/dev/null; then
    echo -e "${YELLOW}  Port $FRONTEND_PORT occupe, arret...${NC}"
    lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null
    sleep 2
fi

cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}  Installation des dependances npm...${NC}"
    npm install --silent 2>/dev/null
fi

echo -e "  Compilation et demarrage..."
npx ng serve > "$PROJECT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

TRIES=0
while [ $TRIES -lt 90 ]; do
    if curl -s -o /dev/null http://localhost:$FRONTEND_PORT 2>/dev/null; then
        echo -e "${GREEN}  OK${NC} - Frontend sur ${BOLD}http://localhost:$FRONTEND_PORT${NC}"
        break
    fi
    if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
        echo -e "${RED}  ERREUR: Le frontend a plante.${NC}"
        tail -20 "$PROJECT_DIR/frontend.log"
        exit 1
    fi
    TRIES=$((TRIES + 1))
    printf "\r  Attente... %ds" "$TRIES"
    sleep 1
done
printf "\r                      \r"

if [ $TRIES -eq 90 ]; then
    echo -e "${RED}  ERREUR: Frontend non demarre apres 90s${NC}"
    tail -20 "$PROJECT_DIR/frontend.log"
    exit 1
fi

# ── Open browser ─────────────────────────────────────────────────────────────
if command -v xdg-open &>/dev/null; then
    xdg-open "http://localhost:$FRONTEND_PORT" &>/dev/null &
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}  ╔════════════════════════════════════════════╗"
echo "  ║        Travel2030 est en marche !          ║"
echo "  ╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Frontend  ${BOLD}http://localhost:$FRONTEND_PORT${NC}"
echo -e "  Backend   ${BOLD}http://localhost:$BACKEND_PORT${NC}"
echo ""
echo -e "  Logs : backend.log / frontend.log"
echo -e "${YELLOW}  Ctrl+C pour tout arreter${NC}"
echo ""

wait
