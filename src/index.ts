#!/usr/bin/env node

import { ACTIONS, SolanaAgentKit, startMcpServer } from "solana-agent-kit";
import * as dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
function validateEnvironment() {
    const requiredEnvVars = {
        'SOLANA_PRIVATE_KEY': process.env.SOLANA_PRIVATE_KEY,
        'RPC_URL': process.env.RPC_URL
    };

    const missingVars = Object.entries(requiredEnvVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
}

async function main() {
    try {
        // Validate environment before proceeding
        validateEnvironment();

        // Initialize the agent with error handling
        const agent = new SolanaAgentKit(
            process.env.SOLANA_PRIVATE_KEY!,
            process.env.RPC_URL!,
            {
                OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
                PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || "",
            },
        );

        const mcp_actions = { ...ACTIONS };

        // Start the MCP server with error handling
        await startMcpServer(mcp_actions, agent, { 
            name: "solana-agent", 
            version: "0.1.0"
        });
    } catch (error) {
        console.error('Failed to start MCP server:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

main();