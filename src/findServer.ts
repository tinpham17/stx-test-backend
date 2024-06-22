import axios from "axios"
import { Server } from "./types/server"
import { CHECK_SERVER_ONLINE_TIMEOUT } from "./configs"

async function isServerOnline(server: Server): Promise<boolean> {
  try {
    const response = await axios.get(server.url, { timeout: CHECK_SERVER_ONLINE_TIMEOUT })
    return response.status >= 200 && response.status < 300
  } catch (error) {
    return false
  }
}

export async function findServer(servers: Server[]): Promise<Server> {
  const serversWithStatus = await Promise.all(servers.map(async (server) => ({
    server,
    isOnline: await isServerOnline(server),
  })))
  const onlineServers = serversWithStatus.filter((server) => server.isOnline)
  if (onlineServers.length === 0) {
    return Promise.reject(new Error("No servers are online"))
  }
  onlineServers.sort((a, b) => a.server.priority - b.server.priority)
  return onlineServers[0].server
}
