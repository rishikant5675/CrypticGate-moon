import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

interface AccessEvent {
  id: string;
  nullifier: string;
  accessGranted: boolean;
  blockHeight: number;
  timestamp: string;
  network: string;
}

let indexedEvents: AccessEvent[] = [
  {
    id: 'evt_001',
    nullifier: 'f4e892c900a12b88491c01e0a293',
    accessGranted: true,
    blockHeight: 184920,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    network: 'Midnight Testnet'
  },
  {
    id: 'evt_002',
    nullifier: 'a9190c2ef881a76c02194a82b9e1',
    accessGranted: true,
    blockHeight: 184928,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    network: 'Midnight Testnet'
  }
];

let activeAllowlistRoot = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

// API Status & Health Check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'CrypticGate Midnight Ledger Event Watcher',
    network: 'Midnight Testnet (Chain ID 0x4a)',
    indexedEventsCount: indexedEvents.length,
    activeAllowlistRoot,
    privacyGuarantee: 'Zero Identity Disclosure (Address & Secret Completely Omitted)'
  });
});

// GET /api/events - List all accessGranted public events
app.get('/api/events', (req, res) => {
  res.json({
    success: true,
    data: indexedEvents
  });
});

// POST /api/events - Push newly indexed accessGranted event
app.post('/api/events', (req, res) => {
  const { nullifier, blockHeight } = req.body;
  if (!nullifier) {
    return res.status(400).json({ error: 'Nullifier string is required' });
  }

  const newEvent: AccessEvent = {
    id: `evt_${Date.now()}`,
    nullifier,
    accessGranted: true,
    blockHeight: blockHeight || Math.floor(185000 + Math.random() * 1000),
    timestamp: new Date().toISOString(),
    network: 'Midnight Testnet'
  };

  indexedEvents.unshift(newEvent);
  res.status(201).json({ success: true, event: newEvent });
});

// GET /api/allowlist-root - Get active Merkle Root
app.get('/api/allowlist-root', (req, res) => {
  res.json({ allowlistRoot: activeAllowlistRoot });
});

app.listen(PORT, () => {
  console.log(`[CrypticGate Indexer] Watching Midnight Ledger on port ${PORT}`);
});
