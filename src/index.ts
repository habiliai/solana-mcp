#!/usr/bin/env node

import {Action, ACTIONS, SolanaAgentKit} from "solana-agent-kit";
import {startMcpServer} from "./mcp.js";
import {zodToMCPShape} from "./utils/zodToMCPSchema.js";
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
                COINGECKO_PRO_API_KEY: process.env.COINGECKO_PRO_API_KEY || "",
            },
        );

        const mcpActions: Record<string, Action> = {};

        for (const [key, action] of Object.entries(ACTIONS)) {
            if (action.name === ACTIONS.OPEN_ORCA_CENTERED_POSITION_WITH_LIQUIDITY_ACTION.name) {
                action.name = 'OPEN_ORCA_POSITION_WITH_LIQUIDITY';
            }

            if (action.schema) {
                // Validate the action schema
                try {
                    zodToMCPShape(action.schema)
                } catch (error) {
                    console.error(`Error in action schema for ${key}`);
                    continue;
                }
            }
            mcpActions[action.name] = action;
        }

        // Start the MCP server with error handling
        await startMcpServer(mcpActions, agent, {
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