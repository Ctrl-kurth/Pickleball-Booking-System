fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: "Hello!" })
}).then(res => res.json()).then(data => console.log(data)).catch(err => console.error(err));
