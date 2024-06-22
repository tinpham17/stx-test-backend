import axios from "axios"
import AxiosMockAdapter from "axios-mock-adapter"
import { findServer } from "./findServer"
import { Server } from "./types/server"

const servers: Server[] = [
  {
    url: "https://does-not-work.perfume.new",
    priority: 1
  },
  {
    url: "https://gitlab.com",
    priority: 4
  },
  {
    url: "http://app.scnt.me",
    priority: 3
  },
  {
    url: "https://offline.scentronix.com",
    priority: 2
  }
]

describe("findServer", () => {
  let axiosMock: AxiosMockAdapter

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios)
  })

  afterEach(() => {
    if (axiosMock) {
      axiosMock.restore()
    }
  })

  it("should reject if no servers are online", async () => {
    for (const server of servers) {
      axiosMock.onGet(server.url).timeout()
    }
    await expect(findServer(servers)).rejects.toThrow("No servers are online")
  })

  it("should return the online server with the lowest priority", async () => {
    axiosMock.onGet(servers[0].url).timeout()
    axiosMock.onGet(servers[1].url).reply(400)
    axiosMock.onGet(servers[2].url).reply(203)
    axiosMock.onGet(servers[3].url).reply(200)

    const server = await findServer(servers)
    expect(server).not.toBeNull()
    expect(server.url).toEqual(servers[3].url)
    expect(server.priority).toEqual(servers[3].priority)
  })
})
