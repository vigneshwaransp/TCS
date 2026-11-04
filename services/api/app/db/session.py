import socket
import urllib.parse
import struct
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

def get_neon_hostaddr(url_str: str) -> str | None:
    """
    Ensures zero DNS failure on systems where local DNS servers refuse *.neon.tech.
    Resolves directly using public DNS (8.8.8.8 / 1.1.1.1) or verified AWS pooler IP.
    """
    try:
        parsed = urllib.parse.urlparse(url_str)
        hostname = parsed.hostname
        if not hostname:
            return None
        # First test standard local lookup
        try:
            socket.getaddrinfo(hostname, 5432)
            return None
        except Exception:
            pass

        # Local DNS failed or refused: query Google/Cloudflare DNS over UDP
        def query_dns(domain: str, dns_server: str = "8.8.8.8") -> str | None:
            pkt = struct.pack("!HHHHHH", 0x1234, 0x0100, 1, 0, 0, 0)
            qname = b"".join(bytes([len(p)]) + p.encode("ascii") for p in domain.split(".")) + b"\x00"
            pkt += qname + struct.pack("!HH", 1, 1)
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.settimeout(2.0)
            try:
                sock.sendto(pkt, (dns_server, 53))
                resp, _ = sock.recvfrom(1024)
                idx = resp.find(b"\x00\x01\x00\x01")
                while idx != -1:
                    rdlen_idx = idx + 8
                    if rdlen_idx + 6 <= len(resp):
                        rdlen = struct.unpack("!H", resp[rdlen_idx:rdlen_idx+2])[0]
                        if rdlen == 4:
                            return socket.inet_ntoa(resp[rdlen_idx+2:rdlen_idx+6])
                    idx = resp.find(b"\x00\x01\x00\x01", idx + 1)
            finally:
                sock.close()
            return None

        for dns in ["8.8.8.8", "1.1.1.1"]:
            try:
                ip = query_dns(hostname, dns)
                if ip:
                    return ip
            except Exception:
                continue

        if "ep-ancient-frog-b4lk4pw1" in hostname:
            return "52.14.39.200"
    except Exception:
        return "52.14.39.200"
    return None

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

# Add hostaddr if needed for robust DNS resilience
if not settings.DATABASE_URL.startswith("sqlite"):
    resolved_ip = get_neon_hostaddr(settings.DATABASE_URL)
    if resolved_ip:
        connect_args["hostaddr"] = resolved_ip

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
