import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchUidArtifacts } from './uid';

afterEach(() => vi.restoreAllMocks());

describe('fetchUidArtifacts', () => {
  it('returns NO_SHOWCASE when avatarInfoList is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ playerInfo: {} }),
      }),
    );
    const r = await fetchUidArtifacts('700000000');
    expect(r).toEqual({ error: 'NO_SHOWCASE' });
  });

  it('returns NOT_FOUND on a non-OK response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    const r = await fetchUidArtifacts('123');
    expect(r).toEqual({ error: 'NOT_FOUND' });
  });

  it('maps equipped reliquaries to artifacts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          avatarInfoList: [
            {
              equipList: [
                {
                  reliquary: { level: 21 },
                  flat: {
                    itemType: 'ITEM_RELIQUARY',
                    equipType: 'EQUIP_BRACER',
                    rankLevel: 5,
                    setNameTextMapHash: 'x',
                    reliquaryMainstat: {
                      mainPropId: 'FIGHT_PROP_HP',
                      statValue: 4780,
                    },
                    reliquarySubstats: [
                      { appendPropId: 'FIGHT_PROP_CRITICAL', statValue: 7 },
                    ],
                  },
                },
              ],
            },
          ],
        }),
      }),
    );
    const r = await fetchUidArtifacts('123');
    expect(Array.isArray(r)).toBe(true);
  });
});
