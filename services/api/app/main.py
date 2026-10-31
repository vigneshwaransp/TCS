from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.seed import seed_database

# API v1 Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.stores import router as stores_router
from app.api.v1.products import router as products_router
from app.api.v1.inventory import router as inventory_router
from app.api.v1.forecasts import router as forecasts_router
from app.api.v1.decisions import router as decisions_router
from app.api.v1.simulations import router as simulations_router
from app.api.v1.replay import router as replay_router
from app.api.v1.ripple import router as ripple_router
from app.api.v1.decision_gate import router as decision_gate_router
from app.api.v1.regret import router as regret_router
from app.api.v1.policies import router as policies_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.data import router as data_router
from app.api.v1.audit import router as audit_router
from app.api.v1.health import router as health_router
from app.api.v1.copilot import router as copilot_router
from app.api.v1.visualizations import router as visualizations_router
from app.api.v1.agents import router as agents_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed database from DMart dataset
    try:
        seed_database()
    except Exception as e:
        print(f"Startup database seeding note: {e}")
    yield
    # Shutdown logic if needed

app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description="AI-Powered Retail Decision Intelligence Platform: Predict retail problems, simulate possible actions, optimize decisions across the network, explain the reasoning, and measure outcomes.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under API v1
api_v1 = settings.API_V1_STR
app.include_router(health_router, prefix=api_v1)
app.include_router(auth_router, prefix=api_v1)
app.include_router(dashboard_router, prefix=api_v1)
app.include_router(stores_router, prefix=api_v1)
app.include_router(products_router, prefix=api_v1)
app.include_router(inventory_router, prefix=api_v1)
app.include_router(forecasts_router, prefix=api_v1)
app.include_router(decisions_router, prefix=api_v1)
app.include_router(simulations_router, prefix=api_v1)
app.include_router(replay_router, prefix=api_v1)
app.include_router(ripple_router, prefix=api_v1)
app.include_router(decision_gate_router, prefix=api_v1)
app.include_router(regret_router, prefix=api_v1)
app.include_router(policies_router, prefix=api_v1)
app.include_router(data_router, prefix=api_v1)
app.include_router(audit_router, prefix=api_v1)
app.include_router(copilot_router, prefix=api_v1)
app.include_router(visualizations_router, prefix=f"{api_v1}/visualizations")
app.include_router(agents_router, prefix=f"{api_v1}/agents")

@app.get("/")
def root():
    return {
        "product": "KINTRAL",
        "tagline": "See the signal. Make the move.",
        "description": "Retail Decision Intelligence Platform",
        "docs_url": "/docs",
        "health_url": f"{api_v1}/health",
        "executive_cockpit": f"{api_v1}/dashboard/summary",
        "visualizations": f"{api_v1}/visualizations/suite",
        "agent_pipeline": f"{api_v1}/agents/run",
        "agent_memory": f"{api_v1}/agents/memory",
    }
