// Centralize API calls here
// export async function getStops() {
//   const res = await fetch("/api/stops");
//   return res.json();
// }

// export async function getLines() {
//   const res = await fetch("/api/lines");
//   return res.json();
// }

export async function getVehicles(line) {
  const res = await fetch(`/api/lines/${line}`);
  return res.json();
}

export async function getStops(line, direction) {
  const res = await fetch(`/api/lines/${line}/stops/${direction}`);
  return res.json();
}

export async function getLines() {
  const res = await fetch("/api/lines");
  return await res.json();
}