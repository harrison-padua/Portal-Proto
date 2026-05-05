import { Injectable, computed, signal } from '@angular/core';
import { Adviser } from '../models/adviser.model';
import { Address, Client, Phone } from '../models/client.model';
import { FAMILY_RELATIONSHIP_TYPES, Relationship, RelationshipType } from '../models/relationship.model';
import { Goal } from '../models/goal.model';
import { Asset, Liability } from '../models/capital.model';
import { buildSeedData } from './mock-data';

const STORAGE_KEY = 'portal-proto-client-management-v1';

interface PersistedState {
  advisers: Adviser[];
  clients: Client[];
  relationships: Relationship[];
  goals: Goal[];
  assets: Asset[];
  liabilities: Liability[];
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

@Injectable({ providedIn: 'root' })
export class ClientStore {
  private readonly _advisers = signal<Adviser[]>([]);
  private readonly _clients = signal<Client[]>([]);
  private readonly _relationships = signal<Relationship[]>([]);
  private readonly _goals = signal<Goal[]>([]);
  private readonly _assets = signal<Asset[]>([]);
  private readonly _liabilities = signal<Liability[]>([]);

  readonly advisers = this._advisers.asReadonly();
  readonly clients = this._clients.asReadonly();
  readonly relationships = this._relationships.asReadonly();
  readonly goals = this._goals.asReadonly();
  readonly assets = this._assets.asReadonly();
  readonly liabilities = this._liabilities.asReadonly();

  constructor() {
    this.load();
  }

  private load(): void {
    let data: PersistedState | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) data = JSON.parse(raw) as PersistedState;
    } catch {
      data = null;
    }
    if (!data) {
      const seed = buildSeedData();
      data = seed;
    }
    this._advisers.set(data.advisers);
    this._clients.set(data.clients);
    this._relationships.set(data.relationships);
    this._goals.set(data.goals);
    this._assets.set(data.assets);
    this._liabilities.set(data.liabilities);
  }

  private persist(): void {
    const state: PersistedState = {
      advisers: this._advisers(),
      clients: this._clients(),
      relationships: this._relationships(),
      goals: this._goals(),
      assets: this._assets(),
      liabilities: this._liabilities(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage may be unavailable in some contexts
    }
  }

  resetToSeed(): void {
    localStorage.removeItem(STORAGE_KEY);
    const seed = buildSeedData();
    this._advisers.set(seed.advisers);
    this._clients.set(seed.clients);
    this._relationships.set(seed.relationships);
    this._goals.set(seed.goals);
    this._assets.set(seed.assets);
    this._liabilities.set(seed.liabilities);
    this.persist();
  }

  // ---------- Lookups ----------

  getClient(id: number): Client | undefined {
    return this._clients().find((c) => c.id === id);
  }

  clientName(id: number): string {
    const c = this.getClient(id);
    if (!c) return 'Unknown';
    return `${c.firstName} ${c.lastName}`.trim();
  }

  adviserById(id: number | null): Adviser | undefined {
    if (id == null) return undefined;
    return this._advisers().find((a) => a.id === id);
  }

  goalsForClient(clientId: number): Goal[] {
    return this._goals().filter((g) => g.clientId === clientId);
  }

  assetsForClient(clientId: number): Asset[] {
    return this._assets().filter((a) => a.ownerClientId === clientId);
  }

  liabilitiesForClient(clientId: number): Liability[] {
    return this._liabilities().filter((l) => l.ownerClientId === clientId);
  }

  relationshipsForClient(clientId: number): Relationship[] {
    return this._relationships().filter(
      (r) => r.fromClientId === clientId || r.toClientId === clientId,
    );
  }

  // For a given client, return [{otherId, type}] entries.
  linkedClients(clientId: number): { otherId: number; type: RelationshipType; relId: string }[] {
    return this._relationships()
      .filter((r) => r.fromClientId === clientId || r.toClientId === clientId)
      .map((r) => ({
        otherId: r.fromClientId === clientId ? r.toClientId : r.fromClientId,
        type: r.type,
        relId: r.id,
      }));
  }

  // Family = traversal across spouse/dependent links only.
  familyClientIds(clientId: number): number[] {
    const visited = new Set<number>([clientId]);
    const queue: number[] = [clientId];
    const rels = this._relationships();
    while (queue.length) {
      const current = queue.shift()!;
      for (const rel of rels) {
        if (!FAMILY_RELATIONSHIP_TYPES.includes(rel.type)) continue;
        const other =
          rel.fromClientId === current
            ? rel.toClientId
            : rel.toClientId === current
              ? rel.fromClientId
              : null;
        if (other != null && !visited.has(other)) {
          visited.add(other);
          queue.push(other);
        }
      }
    }
    return Array.from(visited);
  }

  // ---------- Computed values ----------

  clientPortfolioValue(clientId: number): number {
    const assets = this.assetsForClient(clientId);
    const liabilities = this.liabilitiesForClient(clientId);
    const totalAssets = assets.reduce((s, a) => s + a.currentValue * (a.ownershipPercentage / 100), 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + l.currentBalance, 0);
    return totalAssets - totalLiabilities;
  }

  clientGrossAssets(clientId: number): number {
    return this.assetsForClient(clientId).reduce(
      (s, a) => s + a.currentValue * (a.ownershipPercentage / 100),
      0,
    );
  }

  familyPortfolioValue(clientId: number): number {
    return this.familyClientIds(clientId).reduce(
      (sum, id) => sum + this.clientPortfolioValue(id),
      0,
    );
  }

  /**
   * Equity for an asset: current value (full, before ownership %) minus the balance
   * of any linked liability. Useful for "is this property in the black?" displays.
   */
  assetEquity(assetId: string): number {
    const asset = this._assets().find((a) => a.id === assetId);
    if (!asset) return 0;
    const linked = this._liabilities().filter(
      (l) => l.linked_asset_id === assetId || asset.linked_liability_id === l.id,
    );
    const liabBalance = linked.reduce((s, l) => s + l.currentBalance, 0);
    return asset.currentValue - liabBalance;
  }

  // ---------- Mutations: Clients ----------

  updateClient(updated: Client): void {
    this._clients.update((arr) =>
      arr.map((c) => (c.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : c)),
    );
    this.persist();
  }

  addAddress(clientId: number, address: Omit<Address, 'id'>): void {
    this._clients.update((arr) =>
      arr.map((c) =>
        c.id === clientId
          ? { ...c, addresses: [...c.addresses, { ...address, id: uid('a') }], updatedAt: new Date().toISOString() }
          : c,
      ),
    );
    this.persist();
  }

  updateAddress(clientId: number, addressId: string, patch: Partial<Address>): void {
    this._clients.update((arr) =>
      arr.map((c) =>
        c.id === clientId
          ? {
              ...c,
              addresses: c.addresses.map((a) => (a.id === addressId ? { ...a, ...patch } : a)),
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
    this.persist();
  }

  removeAddress(clientId: number, addressId: string): void {
    this._clients.update((arr) =>
      arr.map((c) =>
        c.id === clientId
          ? {
              ...c,
              addresses: c.addresses.filter((a) => a.id !== addressId),
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
    this.persist();
  }

  addPhone(clientId: number, phone: Omit<Phone, 'id'>): void {
    this._clients.update((arr) =>
      arr.map((c) =>
        c.id === clientId
          ? { ...c, phones: [...c.phones, { ...phone, id: uid('p') }], updatedAt: new Date().toISOString() }
          : c,
      ),
    );
    this.persist();
  }

  removePhone(clientId: number, phoneId: string): void {
    this._clients.update((arr) =>
      arr.map((c) =>
        c.id === clientId
          ? { ...c, phones: c.phones.filter((p) => p.id !== phoneId), updatedAt: new Date().toISOString() }
          : c,
      ),
    );
    this.persist();
  }

  // ---------- Mutations: Relationships ----------

  addRelationship(
    fromClientId: number,
    toClientId: number,
    type: RelationshipType,
    dependentKind?: 'Child' | 'Other',
  ): void {
    if (fromClientId === toClientId) return;
    const exists = this._relationships().some(
      (r) =>
        ((r.fromClientId === fromClientId && r.toClientId === toClientId) ||
          (r.fromClientId === toClientId && r.toClientId === fromClientId)) &&
        r.type === type,
    );
    if (exists) return;
    const rel: Relationship = {
      id: uid('r'),
      fromClientId,
      toClientId,
      type,
      dependentKind,
    };
    this._relationships.update((arr) => [...arr, rel]);
    this.persist();
  }

  removeRelationship(relId: string): void {
    this._relationships.update((arr) => arr.filter((r) => r.id !== relId));
    this.persist();
  }

  // ---------- Mutations: Goals ----------

  addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Goal {
    const now = new Date().toISOString();
    const created: Goal = { ...goal, id: uid('g'), createdAt: now, updatedAt: now };
    this._goals.update((arr) => [...arr, created]);
    this.persist();
    return created;
  }

  updateGoal(updated: Goal): void {
    this._goals.update((arr) =>
      arr.map((g) => (g.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : g)),
    );
    this.persist();
  }

  completeGoal(goalId: string, outcomeNotes: string, completionDate: string): void {
    this._goals.update((arr) =>
      arr.map((g) =>
        g.id === goalId
          ? {
              ...g,
              completed: true,
              outcomeNotes,
              completionDate,
              updatedAt: new Date().toISOString(),
            }
          : g,
      ),
    );
    this.persist();
  }

  reopenGoal(goalId: string): void {
    this._goals.update((arr) =>
      arr.map((g) =>
        g.id === goalId
          ? {
              ...g,
              completed: false,
              outcomeNotes: null,
              completionDate: null,
              updatedAt: new Date().toISOString(),
            }
          : g,
      ),
    );
    this.persist();
  }

  removeGoal(goalId: string): void {
    this._goals.update((arr) => arr.filter((g) => g.id !== goalId));
    this.persist();
  }

  // ---------- Mutations: Assets ----------

  addAsset(asset: Omit<Asset, 'id'>): Asset {
    const created: Asset = { ...asset, id: uid('as') };
    this._assets.update((arr) => [...arr, created]);
    if (created.linked_liability_id) {
      this._liabilities.update((arr) =>
        arr.map((l) => (l.id === created.linked_liability_id ? { ...l, linked_asset_id: created.id } : l)),
      );
    }
    this.persist();
    return created;
  }

  updateAsset(updated: Asset): void {
    const prev = this._assets().find((a) => a.id === updated.id);
    this._assets.update((arr) => arr.map((a) => (a.id === updated.id ? updated : a)));
    if (prev?.linked_liability_id !== updated.linked_liability_id) {
      // unlink previous
      if (prev?.linked_liability_id) {
        this._liabilities.update((arr) =>
          arr.map((l) => (l.id === prev.linked_liability_id ? { ...l, linked_asset_id: null } : l)),
        );
      }
      if (updated.linked_liability_id) {
        this._liabilities.update((arr) =>
          arr.map((l) => (l.id === updated.linked_liability_id ? { ...l, linked_asset_id: updated.id } : l)),
        );
      }
    }
    this.persist();
  }

  removeAsset(assetId: string): void {
    const asset = this._assets().find((a) => a.id === assetId);
    this._assets.update((arr) => arr.filter((a) => a.id !== assetId));
    if (asset?.linked_liability_id) {
      this._liabilities.update((arr) =>
        arr.map((l) => (l.id === asset.linked_liability_id ? { ...l, linked_asset_id: null } : l)),
      );
    }
    this.persist();
  }

  // ---------- Mutations: Liabilities ----------

  addLiability(liability: Omit<Liability, 'id'>): Liability {
    const created: Liability = { ...liability, id: uid('li') };
    this._liabilities.update((arr) => [...arr, created]);
    if (created.linked_asset_id) {
      this._assets.update((arr) =>
        arr.map((a) => (a.id === created.linked_asset_id ? { ...a, linked_liability_id: created.id } : a)),
      );
    }
    this.persist();
    return created;
  }

  updateLiability(updated: Liability): void {
    const prev = this._liabilities().find((l) => l.id === updated.id);
    this._liabilities.update((arr) => arr.map((l) => (l.id === updated.id ? updated : l)));
    if (prev?.linked_asset_id !== updated.linked_asset_id) {
      if (prev?.linked_asset_id) {
        this._assets.update((arr) =>
          arr.map((a) => (a.id === prev.linked_asset_id ? { ...a, linked_liability_id: null } : a)),
        );
      }
      if (updated.linked_asset_id) {
        this._assets.update((arr) =>
          arr.map((a) => (a.id === updated.linked_asset_id ? { ...a, linked_liability_id: updated.id } : a)),
        );
      }
    }
    this.persist();
  }

  removeLiability(liabilityId: string): void {
    const liab = this._liabilities().find((l) => l.id === liabilityId);
    this._liabilities.update((arr) => arr.filter((l) => l.id !== liabilityId));
    if (liab?.linked_asset_id) {
      this._assets.update((arr) =>
        arr.map((a) => (a.id === liab.linked_asset_id ? { ...a, linked_liability_id: null } : a)),
      );
    }
    this.persist();
  }

  // ---------- Helpers ----------

  nextClientId(): number {
    const max = this._clients().reduce((m, c) => (c.id > m ? c.id : m), 1000);
    return max + 1;
  }

  searchClientsByName(query: string, excludeClientId?: number): Client[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this._clients().filter((c) => {
      if (excludeClientId != null && c.id === excludeClientId) return false;
      const name = `${c.firstName} ${c.middleName} ${c.lastName} ${c.preferredName}`.toLowerCase();
      return name.includes(q);
    });
  }
}
