async function main() {
  try {
    const res = await fetch('http://localhost:3000/api/super-admin/organizers');
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error("Fetch Error:", e);
  }
}
main();
