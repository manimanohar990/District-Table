const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
app.use(express.json());
const database = null;

const instalizeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost/:3000");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

instalizeDbAndServer();

const converStateObjectToResponseObject = (dbobject) => {
  return {
    stateId: dbobject.state_id,
    stateName: state_Name,
    population: population,
  };
};

const converDistrictObjectToResponseObject = (dbobject) => {
  return {
    districtId: dbobject.district_id,
    districtName: dbobject.district_name,
    stateId: dbobject.state_id,
    cases: dbobject.cases,
    cured: dbobject.cured,
    active: dbobject.active,
    deaths: dbobject.deaths,
  };
};

app.get("/states/", async (request, response) => {
  const getStateQuary = `
    SELECT 
    *
    FROM
    state
    ORDER_BY
    state_id;`;
  const stateArray = await database.all(getStateQuary);
  response.send(
    stateArray.map((eachstate) => converStateObjectToResponseObject(eachstate))
  );
});
app.get("/states/stateId", async (request, response) => {
  const getStateQuary = `
    SELECT 
    *
    FROM
    state
    ORDER_BY
    state_id;`;
  const state = await database.get(getStateQuary);

  response.send(converStateObjectToResponseObject(state));
});

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const postDistrictQuary = `
    INSER INTO 
    district (distrct_name,state_id,cases,cured, active, deaths)
    VALUES (${districtName},${stateId},${cases},${cured},${active},${deaths});
    `;
  await database.run(postDistrictQuary);
  response.send("District Successfully Added");
});

app.get("districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictId = `
    SELECT
    *
    FROM
    district
    WHERE 
    district_id = ${districtId};
    `;
  const districtget = await database.get(getDistrictId);
  response.send(converDistrictObjectToResponseObject(districtget));
});
app.delete("districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictId = `
    SELECT FROM
    district
    WHERE 
    district_id = ${districtId}
    `;
  await database.run(deleteDistrictId);
  response.send("District Removed");
});

app.put("districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateQuary = `
  UPDATE district
  SET 
  district_name = ${districtName},
  state_id = ${stateId},
  cases = ${cases},
  cured = ${cured},
  active = ${active},
  deaths = ${deaths}
  WHERE 
  district_id  =  ${districtId};
    `;
  await database.run(updateQuary);
  response.send("District Details Updated");
});
app.get("/states/:stateId/stats", async (request, response) => {
  const { stateId } = request.params;
  const getDistrictStateQuary = `
    SELECT 
    SUM(cases) as totalcases,
    SUM(cured) as totalcured,
    SUM(active) as totalactive,
    SUM(deaths) as totaldeaths

    FEOME 
    district
    WHERE
    state_id = ${stateId};`;
  const stateArray = await database.get(getDistrictStateQuary);
  response.send(stateArray);
});

app.get("districts/:districtId/details", async (request, response) => {
  const { districtId } = request.params;
  const getDisterictquary = `
    SELECT state_id
    FROM district
    WHERE 
    district_id = ${districtId}
    `;
  const getDistrictQuaryResponse = await database.get(getDisterictquary);

  const getStateNameQuary = `
    SELECT state_name as stateName FROM 
    state
    WHERE 
    state_id = ${getDistrictQuaryResponse.state_id}`;

  const getStateQuarys = await database.get(getStateNameQuary);
  response.send(getStateQuarys);
});
module.exports = app;
