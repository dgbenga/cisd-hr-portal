'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  Laptop,
  Smartphone,
  Tv,
  Car,
  CreditCard,
  Plus,
  Search,
  Filter,
  UserCheck,
  RotateCcw,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Eye,
  Building2,
  Tag,
  History,
  X
} from 'lucide-react';
import { Asset, AssetCategory, AssetCondition, AssetStatus } from '@/lib/types';

export default function AssetManagementModule() {
  const { db, currentUser, setSelectedEmployeeIdForModal, dispatch, showToast } = usePortal();

  const isEmployee = currentUser.role === 'EMPLOYEE';
  const isLineManager = currentUser.role === 'LINE_MANAGER';
  const isHRAdmin = currentUser.role === 'HR_ADMIN';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const [employeeAssetTab, setEmployeeAssetTab] = useState<'MY_ASSETS' | 'ALL_ASSETS'>('MY_ASSETS');
  const [showRequestEquipmentModal, setShowRequestEquipmentModal] = useState(false);
  const [requestAssetType, setRequestAssetType] = useState('LAPTOP');
  const [requestReason, setRequestReason] = useState('');

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState<Asset | null>(null);
  const [assigneeId, setAssigneeId] = useState('');

  // Asset detail modal
  const [detailedAsset, setDetailedAsset] = useState<Asset | null>(null);

  // Maintenance Modal State
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [selectedAssetForMaint, setSelectedAssetForMaint] = useState<Asset | null>(null);
  const [maintDesc, setMaintDesc] = useState('');
  const [maintCost, setMaintCost] = useState(0);
  const [maintBy, setMaintBy] = useState('David Kalu (IT Lead)');

  // Form State for New Asset
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('LAPTOP');
  const [serialNumber, setSerialNumber] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('2024-03-15');
  const [condition, setCondition] = useState<AssetCondition>('EXCELLENT');
  const [location, setLocation] = useState('Abuja Head Office, IT Safe');

  if (!db) return null;

  const myAssets = db.assets.filter(a => a.assignedToId === currentUser.id);

  const filteredAssets = db.assets.filter(a => {
    if (isEmployee && employeeAssetTab === 'MY_ASSETS') {
      if (a.assignedToId !== currentUser.id) return false;
    }
    const matchCat = filterCategory === 'ALL' || a.category === filterCategory;
    const matchStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      a.name.toLowerCase().includes(q) ||
      a.assetCode.toLowerCase().includes(q) ||
      a.serialNumber.toLowerCase().includes(q);
    return matchCat && matchStatus && matchSearch;
  });

  const assignedCount = db.assets.filter(a => a.status === 'ASSIGNED').length;
  const availableCount = db.assets.filter(a => a.status === 'AVAILABLE').length;
  const maintenanceCount = db.assets.filter(a => a.status === 'IN_MAINTENANCE').length;

  const handleOpenAdd = () => {
    setName('');
    setCategory('LAPTOP');
    setSerialNumber('');
    setAcquisitionDate('2024-03-15');
    setCondition('EXCELLENT');
    setLocation('Abuja Head Office, IT Safe');
    setShowAddModal(true);
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch('CREATE_ASSET', {
      name,
      category,
      serialNumber,
      acquisitionDate,
      condition,
      status: 'AVAILABLE',
      location
    });
    if (res.success) {
      showToast('Asset registered into institutional inventory', 'success');
      setShowAddModal(false);
    }
  };

  const handleOpenAssign = (asset: Asset) => {
    setSelectedAssetForAssign(asset);
    setAssigneeId(db.employees[0]?.id || 'emp-1');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForAssign) return;
    const res = await dispatch('ASSIGN_ASSET', {
      assetId: selectedAssetForAssign.id,
      employeeId: assigneeId
    });
    if (res.success) {
      const emp = db.employees.find(e => e.id === assigneeId);
      showToast(`Asset assigned to ${emp?.firstName} ${emp?.lastName}`, 'success');
      setShowAssignModal(false);
      if (detailedAsset && detailedAsset.id === selectedAssetForAssign.id) {
        setDetailedAsset(null);
      }
    }
  };

  const handleReturnAsset = async (asset: Asset) => {
    if (confirm(`Check-in ${asset.name} (${asset.assetCode}) back to equipment pool?`)) {
      const res = await dispatch('RETURN_ASSET', {
        assetId: asset.id,
        condition: 'GOOD'
      });
      if (res.success) {
        showToast('Asset returned to central inventory pool', 'info');
        if (detailedAsset && detailedAsset.id === asset.id) {
          setDetailedAsset(null);
        }
      }
    }
  };

  const handleOpenMaint = (asset: Asset) => {
    setSelectedAssetForMaint(asset);
    setMaintDesc('Periodic diagnostic check, firmware security update, and battery calibration.');
    setMaintCost(0);
    setMaintBy('David Kalu (IT Lead)');
    setShowMaintModal(true);
  };

  const handleMaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForMaint) return;

    const newLog = {
      date: new Date().toISOString().split('T')[0],
      description: maintDesc,
      cost: Number(maintCost),
      performedBy: maintBy
    };

    const updatedLogs = [...(selectedAssetForMaint.maintenanceLogs || []), newLog];

    const res = await dispatch('UPDATE_ASSET', {
      id: selectedAssetForMaint.id,
      maintenanceLogs: updatedLogs
    });

    if (res.success) {
      showToast('Maintenance service record logged into asset history', 'success');
      setShowMaintModal(false);
      if (detailedAsset && detailedAsset.id === selectedAssetForMaint.id) {
        setDetailedAsset({ ...selectedAssetForMaint, maintenanceLogs: updatedLogs });
      }
    }
  };

  const toggleStatusFilter = (st: string) => {
    if (filterStatus === st) {
      setFilterStatus('ALL');
    } else {
      setFilterStatus(st);
    }
  };

  const getCategoryIcon = (cat: AssetCategory) => {
    switch (cat) {
      case 'LAPTOP': return <Laptop className="h-4 w-4" />;
      case 'PHONE': return <Smartphone className="h-4 w-4" />;
      case 'MONITOR': return <Tv className="h-4 w-4" />;
      case 'VEHICLE': return <Car className="h-4 w-4" />;
      case 'ACCESS_CARD': return <CreditCard className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {isEmployee ? 'My Institutional Equipment & Assigned Hardware' : 'Institutional Property & Asset Registry'}
          </h2>
          <p className="text-xs text-slate-500">
            {isEmployee
              ? 'Laptops, diplomatic badges, mobile devices, and institutional accessories assigned to your custody'
              : 'Track hardware, secure diplomatic laptops, official vehicles, access tokens, and custody histories'}
          </p>
        </div>

        {isEmployee ? (
          <button
            onClick={() => setShowRequestEquipmentModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition self-start sm:self-auto"
          >
            <Laptop className="h-4 w-4 text-cisd-gold-400" />
            Request Hardware / IT Support
          </button>
        ) : (isSuperAdmin || isHRAdmin) && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 text-cisd-gold-400" />
            Register Asset
          </button>
        )}
      </div>

      {/* KPI Stats */}
      {isEmployee ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">My Assigned Assets</span>
            <p className="text-2xl font-black text-cisd-navy-900">{myAssets.length} Items</p>
            <span className="text-[11px] text-emerald-600 font-semibold">Active custody</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Hardware Health</span>
            <p className="text-2xl font-black text-emerald-600">100%</p>
            <span className="text-[11px] text-slate-500">Fully operational</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Primary Device</span>
            <p className="text-sm font-bold text-slate-900 truncate mt-1.5">
              {myAssets.find(a => a.category === 'LAPTOP')?.name || 'Standard Fellow Laptop'}
            </p>
            <span className="text-[11px] text-slate-500">Encrypted</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">IT Support Desk</span>
            <p className="text-sm font-bold text-slate-900 mt-1.5">Floor 2, Helpdesk</p>
            <span className="text-[11px] text-slate-500">it-support@cisd.org</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            onClick={() => setFilterStatus('ALL')}
            className={`cursor-pointer rounded-2xl border p-4 shadow-sm space-y-1 transition hover:scale-[1.02] ${
              filterStatus === 'ALL' ? 'border-cisd-navy-900 bg-white ring-2 ring-cisd-navy-900/10' : 'border-slate-200 bg-white'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Assets</span>
            <p className="text-2xl font-black text-slate-900">{db.assets.length}</p>
            <span className="text-[11px] text-slate-500">Click to show all</span>
          </div>

          <div
            onClick={() => toggleStatusFilter('ASSIGNED')}
            className={`cursor-pointer rounded-2xl border p-4 shadow-sm space-y-1 transition hover:scale-[1.02] ${
              filterStatus === 'ASSIGNED' ? 'border-cisd-navy-900 bg-cisd-navy-50/30 ring-2 ring-cisd-navy-900/20' : 'border-slate-200 bg-white'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned in Field</span>
            <p className="text-2xl font-black text-cisd-navy-900">{assignedCount}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">Active staff custody</span>
          </div>

          <div
            onClick={() => toggleStatusFilter('AVAILABLE')}
            className={`cursor-pointer rounded-2xl border p-4 shadow-sm space-y-1 transition hover:scale-[1.02] ${
              filterStatus === 'AVAILABLE' ? 'border-emerald-600 bg-emerald-50/30 ring-2 ring-emerald-500/20' : 'border-slate-200 bg-white'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Available in Pool</span>
            <p className="text-2xl font-black text-emerald-600">{availableCount}</p>
            <span className="text-[11px] text-slate-500">Ready for allocation</span>
          </div>

          <div
            onClick={() => toggleStatusFilter('IN_MAINTENANCE')}
            className={`cursor-pointer rounded-2xl border p-4 shadow-sm space-y-1 transition hover:scale-[1.02] ${
              filterStatus === 'IN_MAINTENANCE' ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20' : 'border-slate-200 bg-white'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">In Maintenance</span>
            <p className="text-2xl font-black text-amber-600">{maintenanceCount}</p>
            <span className="text-[11px] text-slate-500">Service underway</span>
          </div>
        </div>
      )}

      {/* Employee View Mode Switcher */}
      {isEmployee && (
        <div className="flex border-b border-slate-200 text-xs font-bold space-x-6">
          <button
            onClick={() => setEmployeeAssetTab('MY_ASSETS')}
            className={`pb-3 border-b-2 transition ${
              employeeAssetTab === 'MY_ASSETS'
                ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Issued Hardware ({myAssets.length})
          </button>
          <button
            onClick={() => setEmployeeAssetTab('ALL_ASSETS')}
            className={`pb-3 border-b-2 transition ${
              employeeAssetTab === 'ALL_ASSETS'
                ? 'border-cisd-navy-900 text-cisd-navy-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Institutional Pool Directory ({db.assets.length})
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by asset name, barcode code, or serial..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterStatus !== 'ALL' && (
            <button
              onClick={() => setFilterStatus('ALL')}
              className="text-xs font-bold text-cisd-navy-900 bg-slate-100 px-2 py-1 rounded-lg"
            >
              Clear Status Filter ({filterStatus}) &times;
            </button>
          )}

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700"
          >
            <option value="ALL">All Asset Categories</option>
            <option value="LAPTOP">Laptops</option>
            <option value="PHONE">Phones / Mobile</option>
            <option value="MONITOR">Monitors</option>
            <option value="VEHICLE">Vehicles</option>
            <option value="AUDIO_VISUAL">Audio / Visual</option>
            <option value="ACCESS_CARD">Access Badges</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="AVAILABLE">Available</option>
            <option value="IN_MAINTENANCE">In Maintenance</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map(asset => {
          const assignedEmp = db.employees.find(e => e.id === asset.assignedToId);
          return (
            <div
              key={asset.id}
              onClick={() => setDetailedAsset(asset)}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-cisd-navy-400 hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-cisd-navy-50 p-2 text-cisd-navy-900">
                      {getCategoryIcon(asset.category)}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-cisd-navy-900 bg-slate-100 px-1.5 py-0.5 rounded">
                        {asset.assetCode}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{asset.category}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    asset.status === 'ASSIGNED' ? 'bg-cisd-navy-900 text-white' :
                    asset.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {asset.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{asset.name}</h3>
                <p className="text-[11px] text-slate-500 font-mono mt-1">SN: {asset.serialNumber}</p>

                <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Condition:</span>
                    <strong className="text-slate-800">{asset.condition}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Location:</span>
                    <span className="text-slate-700 truncate max-w-[150px]">{asset.location}</span>
                  </div>
                  {asset.maintenanceLogs?.length > 0 && (
                    <div className="flex justify-between text-slate-500 text-[10px] pt-1 border-t border-slate-200/60">
                      <span>Service Records:</span>
                      <span className="font-semibold text-cisd-navy-800">{asset.maintenanceLogs.length} events</span>
                    </div>
                  )}
                </div>

                {/* Assigned To Info */}
                <div className="mt-3 pt-2 border-t border-slate-100 text-xs">
                  {assignedEmp ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployeeIdForModal(assignedEmp.id);
                      }}
                      className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-lg transition"
                    >
                      <img
                        src={assignedEmp.avatar}
                        alt={assignedEmp.firstName}
                        className="h-7 w-7 rounded-full object-cover border"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-[11px] truncate">
                          {assignedEmp.firstName} {assignedEmp.lastName}
                        </p>
                        <p className="text-[10px] text-slate-400">Since {asset.assignedDate}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 py-1">
                      <span className="font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        In Safe Pool
                      </span>
                      <span className="text-slate-400">Acquired {asset.acquisitionDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {!isEmployee && (isSuperAdmin || isHRAdmin) ? (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
                  {asset.status === 'AVAILABLE' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAssign(asset);
                      }}
                      className="flex-1 rounded-lg bg-cisd-navy-900 py-1.5 font-bold text-white hover:bg-cisd-navy-800 shadow transition flex items-center justify-center gap-1"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-cisd-gold-400" />
                      Assign to Staff
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReturnAsset(asset);
                      }}
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Check-in
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenMaint(asset);
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-cisd-navy-900 transition"
                    title="Log Maintenance Service"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {asset.assignedToId === currentUser.id ? 'In Your Custody' : 'CISD Pool'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailedAsset(asset);
                    }}
                    className="flex items-center gap-1 font-bold text-cisd-navy-900 hover:underline text-xs"
                  >
                    <Eye className="h-3.5 w-3.5 text-cisd-gold-600" />
                    Specs & History
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Asset Dossier & Service History Modal */}
      {detailedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-cisd-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                  {detailedAsset.assetCode} &bull; {detailedAsset.category}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">{detailedAsset.name}</h3>
                <p className="text-xs text-slate-500">SN: {detailedAsset.serialNumber}</p>
              </div>
              <button onClick={() => setDetailedAsset(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              {/* Custody Info */}
              <div className="rounded-xl bg-slate-50 p-3 space-y-2">
                <span className="font-bold text-slate-700 block text-xs uppercase tracking-wide">Custody & Allocation</span>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Status</span>
                    <strong className="text-slate-800">{detailedAsset.status}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Condition</span>
                    <strong className="text-slate-800">{detailedAsset.condition}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Custodian</span>
                    {detailedAsset.assignedToId ? (
                      <span className="font-semibold text-cisd-navy-900">
                        {db.employees.find(e => e.id === detailedAsset.assignedToId)?.firstName}{' '}
                        {db.employees.find(e => e.id === detailedAsset.assignedToId)?.lastName}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">In Equipment Pool</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Location</span>
                    <span className="text-slate-700">{detailedAsset.location}</span>
                  </div>
                </div>
              </div>

              {/* Maintenance Log Records */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 block text-xs">
                    Maintenance & Service History ({detailedAsset.maintenanceLogs?.length || 0})
                  </span>
                  <button
                    onClick={() => handleOpenMaint(detailedAsset)}
                    className="flex items-center gap-1 text-[10px] font-bold text-cisd-navy-900 hover:underline"
                  >
                    <Wrench className="h-3 w-3" /> Log New Service
                  </button>
                </div>

                {detailedAsset.maintenanceLogs && detailedAsset.maintenanceLogs.length > 0 ? (
                  <div className="space-y-2">
                    {detailedAsset.maintenanceLogs.map((log, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>{log.date}</span>
                          <span className="font-semibold text-slate-700">Cost: ${log.cost}</span>
                        </div>
                        <p className="text-slate-700 text-xs">{log.description}</p>
                        <span className="text-[10px] text-slate-500 block">Serviced by: {log.performedBy}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-xs">No maintenance history recorded for this asset.</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              {detailedAsset.status === 'AVAILABLE' ? (
                <button
                  onClick={() => handleOpenAssign(detailedAsset)}
                  className="rounded-lg bg-cisd-navy-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-cisd-navy-800"
                >
                  Assign to Colleague
                </button>
              ) : (
                <button
                  onClick={() => handleReturnAsset(detailedAsset)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Check-in Asset
                </button>
              )}
              <button
                onClick={() => setDetailedAsset(null)}
                className="rounded-lg border px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Register New Institutional Asset</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Name & Specifications</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro 16 M3 Max or Dell UltraSharp 32"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asset Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="LAPTOP">Laptop</option>
                    <option value="PHONE">Phone / Mobile</option>
                    <option value="MONITOR">Monitor / Display</option>
                    <option value="VEHICLE">Official Vehicle</option>
                    <option value="AUDIO_VISUAL">Audio / Visual</option>
                    <option value="ACCESS_CARD">Access Badge</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="NEW">New (Unopened)</option>
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serial Number / IMEI</label>
                  <input
                    type="text"
                    required
                    placeholder="SN-CISD-XXXX"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Acquisition Date</label>
                  <input
                    type="date"
                    required
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location / Safe Storage</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Asset Modal */}
      {showAssignModal && selectedAssetForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Assign Asset Custody</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-3.5 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5 space-y-1">
                <p className="font-bold text-slate-900">{selectedAssetForAssign.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">Code: {selectedAssetForAssign.assetCode}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Staff Member</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                >
                  {db.employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Confirm Custody Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Service Modal */}
      {showMaintModal && selectedAssetForMaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Log Asset Maintenance Service</h3>
              <button onClick={() => setShowMaintModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleMaintSubmit} className="space-y-3.5 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5 space-y-1">
                <p className="font-bold text-slate-900">{selectedAssetForMaint.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">SN: {selectedAssetForMaint.serialNumber}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Maintenance Scope & Diagnostic Work</label>
                <textarea
                  rows={3}
                  required
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost (USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={maintCost}
                    onChange={(e) => setMaintCost(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Technician / Provider</label>
                  <input
                    type="text"
                    value={maintBy}
                    onChange={(e) => setMaintBy(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowMaintModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Log Service Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Asset Request / IT Support Modal */}
      {showRequestEquipmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <span className="rounded bg-cisd-navy-100 text-cisd-navy-900 text-[10px] font-bold px-2 py-0.5">
                  IT Infrastructure Requisition
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  Request Equipment or IT Support
                </h3>
              </div>
              <button
                onClick={() => setShowRequestEquipmentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast(
                  `IT Hardware requisition for ${requestAssetType} routed to IT Operations & HR`,
                  'success'
                );
                setShowRequestEquipmentModal(false);
                setRequestReason('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Equipment Category</label>
                <select
                  value={requestAssetType}
                  onChange={(e) => setRequestAssetType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                >
                  <option value="LAPTOP">Official Diplomatic Laptop (Dell XPS / ThinkPad)</option>
                  <option value="MONITOR">Dual External Display / Docking Station</option>
                  <option value="PHONE">Encrypted Mobile Handset</option>
                  <option value="ACCESS_CARD">Biometric Diplomatic Access Card / Token</option>
                  <option value="MAINTENANCE">Hardware Repair / Technical Diagnostics</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requester</label>
                <input
                  type="text"
                  readOnly
                  value={`${currentUser.firstName} ${currentUser.lastName} (${currentUser.designation})`}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Justification / Issue Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify field deployment requirements, replacement justification, or technical hardware defect..."
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowRequestEquipmentModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
