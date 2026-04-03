async function test() {
  const res = await fetch('https://api.alquran.cloud/v1/ayah/2:255/ar.alafasy');
  const data = await res.json();
  console.log(data?.data?.audio);
}
test();
