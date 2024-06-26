const Controller = require("./apicontroller");

it("can be instantiated without crashing", () => {
  const controller = Controller({});
  expect(controller).toBeDefined();
});

it("getTracks - error response when no google_token token is present in the header", async () => {
  const deps = {};
  const controller = Controller(deps);
  const req = {
    query: {},
  };
  const res = makeRes();

  await controller.processTracksRequest(req, res);

  expect(res.json).toHaveBeenCalledWith({
    error: {
      msg: expect.any(String),
    },
  });
});

it("getTracks - error response when the track store rejects", async () => {
  const store = {
    getTracks: jest.fn().mockRejectedValue(new Error("Store error")),
  };
  const deps = makeDeps(store);
  const controller = Controller(deps);
  const req = {
    query: { google_token: "{}" },
  };
  const res = makeRes();

  await controller.processTracksRequest(req, res);

  expect(store.getTracks).toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith({
    error: {
      msg: expect.any(String),
    },
  });
});

it("getTracks - error response when LastFM rejects", async () => {
  const store = {
    getTracks: jest.fn().mockResolvedValue([
      {
        id: "track_1",
        name: "Artist 1 - Title 1",
      },
      {
        id: "track_2",
        name: "Artist 2 - Title 2",
      },
    ]),
  };
  const lastFM = {
    metadataForTracks: jest.fn().mockRejectedValue(new Error("LastFM Error")),
  };
  const deps = makeDeps(store, lastFM);
  const controller = Controller(deps);
  const req = {
    query: { google_token: "{}" },
  };
  const res = makeRes();

  await controller.processTracksRequest(req, res);

  expect(store.getTracks).toHaveBeenCalled();
  expect(lastFM.metadataForTracks).toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith({
    error: {
      msg: expect.any(String),
    },
  });
});

it("getTracks - returns tracks and metadata successfully", async () => {
  const store = {
    getTracks: jest.fn().mockResolvedValue([
      {
        id: "track_1",
        name: "Artist 1 - Title 1",
      },
      {
        id: "track_2",
        name: "Artist 2 - Title 2",
      },
    ]),
  };
  const lastFM = {
    metadataForTracks: jest
      .fn()
      .mockResolvedValue([{ album: "Album 1" }, { album: "Album 2" }]),
  };
  const deps = makeDeps(store, lastFM);
  const controller = Controller(deps);
  const req = {
    query: { google_token: "{}" },
  };
  const res = makeRes();

  await controller.processTracksRequest(req, res);

  expect(store.getTracks).toHaveBeenCalled();
  expect(lastFM.metadataForTracks).toHaveBeenCalledWith([
    {
      artist: "Artist 1",
      track: "Title 1",
    },
    {
      artist: "Artist 2",
      track: "Title 2",
    },
  ]);
  expect(res.json).toHaveBeenCalledWith({
    tracks: [
      {
        id: "track_1",
        name: "Artist 1 - Title 1",
        album: "Album 1",
      },
      {
        id: "track_2",
        name: "Artist 2 - Title 2",
        album: "Album 2",
      },
    ],
  });
});

it("getTrack - error response when no google_token token is present in the header", async () => {
  const deps = {};
  const controller = Controller(deps);
  const req = {
    query: { id: "track_1" },
  };
  const res = makeRes();

  await controller.processTrackRequest(req, res);

  expect(res.json).toHaveBeenCalledWith({
    error: {
      msg: expect.any(String),
    },
  });
});

it("getTrack - error response when the track store rejects", async () => {
  const store = {
    getTrack: jest.fn().mockRejectedValue(new Error("Store error")),
  };
  const deps = makeDeps(store);
  const controller = Controller(deps);
  const req = {
    query: {
      id: "track_1",
      google_token: "{}",
    },
  };
  const res = makeRes();

  await controller.processTrackRequest(req, res);

  expect(store.getTrack).toHaveBeenCalledWith("track_1");
  expect(res.json).toHaveBeenCalledWith({
    error: {
      msg: expect.any(String),
    },
  });
});

it("getTrack - pipes the track into the response", async () => {
  const track = {
    pipe: jest.fn(),
  };
  const store = {
    getTrack: jest.fn().mockResolvedValue(track),
  };
  const deps = makeDeps(store);
  const controller = Controller(deps);
  const req = {
    query: {
      id: "track_1",
      google_token: "{}",
    },
  };
  const res = makeRes();

  await controller.processTrackRequest(req, res);

  expect(store.getTrack).toHaveBeenCalledWith("track_1");
  expect(track.pipe).toHaveBeenCalledWith(res);
  expect(res.json).not.toHaveBeenCalled();
});

function makeRes() {
  return {
    json: jest.fn(),
  };
}

function makeDeps(store, lastFM) {
  return {
    getStore: () => store,
    getLastFM: () => lastFM,
  };
}
