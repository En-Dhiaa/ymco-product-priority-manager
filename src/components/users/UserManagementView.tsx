import React, { useState, useMemo } from 'react';
import { useProducts } from '../../context/ProductContext';
import { User, Role, PermissionKey, UserRole } from '../../types';
import { ALL_PERMISSIONS } from '../../data/initialConfig';
import {
  Users as UsersIcon, Shield, Key, UserPlus, Check, X, 
  Search, Lock, Unlock, RefreshCw, AlertTriangle, CheckSquare, 
  Square, Edit3, Trash2, Mail, Building, UserCheck, ShieldAlert,
  ChevronRight, ArrowRightLeft, Eye, Award, Sparkles, Filter
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const {
    users,
    roles,
    currentUser,
    hasPermission,
    addUser,
    updateUser,
    toggleUserStatus,
    resetUserPassword,
    addRole,
    updateRole,
    switchUser,
    settings,
    logAuditEvent
  } = useProducts();

  const isAr = settings.language === 'ar';

  // Active Tab: 'users' | 'matrix' | 'roles'
  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('users');

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add / Edit User Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formName, setFormName] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('editor');
  const [formRoleId, setFormRoleId] = useState<string>('editor');
  const [formDepartment, setFormDepartment] = useState('Regulatory & Scientific Affairs');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'disabled'>('active');

  // Add / Edit Role Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleNameEn, setRoleNameEn] = useState('');
  const [roleNameAr, setRoleNameAr] = useState('');
  const [roleDescEn, setRoleDescEn] = useState('');
  const [roleDescAr, setRoleDescAr] = useState('');
  const [roleColor, setRoleColor] = useState('#6D28D9');
  const [selectedRolePerms, setSelectedRolePerms] = useState<PermissionKey[]>([]);

  // Feedback message
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setActionAlert({ type, message });
    setTimeout(() => setActionAlert(null), 4000);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'all' && u.roleId !== roleFilter && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && (u.status || 'active') !== statusFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q) || u.nameAr.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchDept = (u.department || '').toLowerCase().includes(q);
        return matchName || matchEmail || matchDept;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, userSearch]);

  // Group permissions by category for the matrix
  const permissionCategories = useMemo(() => {
    const cats: { [category: string]: typeof ALL_PERMISSIONS } = {};
    ALL_PERMISSIONS.forEach(p => {
      if (!cats[p.category]) cats[p.category] = [];
      cats[p.category].push(p);
    });
    return cats;
  }, []);

  // Open Create User Modal
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setFormName('');
    setFormNameAr('');
    setFormEmail('');
    setFormRole('editor');
    setFormRoleId('editor');
    setFormDepartment('Regulatory & Scientific Affairs');
    setFormPassword('');
    setFormStatus('active');
    setIsUserModalOpen(true);
  };

  // Open Edit User Modal
  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormNameAr(user.nameAr);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormRoleId(user.roleId || user.role);
    setFormDepartment(user.department || '');
    setFormPassword('');
    setFormStatus(user.status || 'active');
    setIsUserModalOpen(true);
  };

  // Save User
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    if (editingUser) {
      const updated: User = {
        ...editingUser,
        name: formName.trim(),
        nameAr: formNameAr.trim() || formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        roleId: formRoleId,
        department: formDepartment.trim(),
        status: formStatus
      };

      const success = updateUser(updated);
      if (success) {
        showAlert(isAr ? 'تم تحديث بيانات المستخدم بنجاح' : 'User account updated successfully');
        setIsUserModalOpen(false);
      } else {
        showAlert(
          isAr 
            ? 'خطأ حماية: لا يمكن تعديل أو تعطيل المشرف الرئيسي الأخير في النظام!' 
            : 'Protection Error: Cannot demote or disable the last active Super Admin!',
          'error'
        );
      }
    } else {
      addUser({
        name: formName.trim(),
        nameAr: formNameAr.trim() || formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        roleId: formRoleId,
        department: formDepartment.trim(),
        status: formStatus
      });
      showAlert(isAr ? 'تمت إضافة المستخدم بنجاح' : 'User created successfully');
      setIsUserModalOpen(false);
    }
  };

  // Toggle User Status with self-protection
  const handleToggleStatus = (user: User) => {
    const success = toggleUserStatus(user.id);
    if (!success) {
      showAlert(
        isAr 
          ? 'إجراء مرفوض: لا يمكن تعطيل المشرف الرئيسي الأخير لضمان استمرارية النظام!' 
          : 'Action Denied: Cannot disable the last active Super Admin!',
        'error'
      );
    } else {
      showAlert(
        user.status === 'disabled' 
          ? (isAr ? `تم تنشيط حساب ${user.nameAr}` : `Activated account for ${user.name}`)
          : (isAr ? `تم تعطيل حساب ${user.nameAr}` : `Disabled account for ${user.name}`)
      );
    }
  };

  // Toggle Matrix Permission for a Role
  const handleToggleMatrixPermission = (role: Role, permKey: PermissionKey) => {
    if (!hasPermission('users.assign_roles')) {
      showAlert(isAr ? 'لا تملك صلاحية تعديل صلاحيات الأدوار' : 'You do not have permission to edit roles', 'error');
      return;
    }

    // Protect Super Admin role from having essential permissions revoked
    if (role.id === 'super_admin' && (permKey === 'users.edit' || permKey === 'users.assign_roles' || permKey === 'priorities.edit')) {
      showAlert(
        isAr 
          ? 'محمي: لا يمكن إزالة هذه الصلاحية الجوهرية من دور المشرف العام!' 
          : 'Protected: Cannot revoke core permission from Super Admin role!',
        'error'
      );
      return;
    }

    const has = role.permissions.includes(permKey);
    const updatedPerms = has 
      ? role.permissions.filter(p => p !== permKey)
      : [...role.permissions, permKey];

    const updatedRole: Role = {
      ...role,
      permissions: updatedPerms
    };

    updateRole(updatedRole);
    logAuditEvent(
      'permission_change',
      `Toggled permission "${permKey}" for role "${role.nameEn}"`,
      `تعديل الصلاحية "${permKey}" للدور "${role.nameAr}"`,
      'role',
      role.id
    );
  };

  // Save New Custom Role
  const handleSaveCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleNameEn.trim()) return;

    const newId = roleNameEn.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newRole: Role = {
      id: newId,
      nameEn: roleNameEn.trim(),
      nameAr: roleNameAr.trim() || roleNameEn.trim(),
      descriptionEn: roleDescEn.trim(),
      descriptionAr: roleDescAr.trim() || roleDescEn.trim(),
      badgeColor: roleColor,
      isSystemRole: false,
      permissions: selectedRolePerms
    };

    addRole(newRole);
    showAlert(isAr ? 'تم إنشاء الدور المخصص بنجاح' : 'Custom role created successfully');
    setIsRoleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold">
              <UsersIcon className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isAr ? 'إدارة المستخدمين ومصفوفة الصلاحيات (RBAC)' : 'User Management & Access Control (RBAC)'}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                  {users.length} {isAr ? 'مستخدمين' : 'Users'}
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isAr 
                  ? 'التحكم الدقيق في صلاحيات الوصول للأقسام والعمليات عبر 32 مفتاح صلاحية مع حماية حساب المشرف العام' 
                  : 'Enterprise Role-Based Access Control across 32 granular permissions with self-protection safeguards'}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {hasPermission('users.create') && (
              <button
                onClick={handleOpenCreateUser}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-xl shadow-sm transition-all hover:shadow hover:scale-[1.01]"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isAr ? 'إضافة مستخدم جديد' : 'New User'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionAlert && (
          <div className={`mt-4 p-3 rounded-xl border flex items-center gap-2.5 text-xs animate-fadeIn ${
            actionAlert.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
          }`}>
            {actionAlert.type === 'error' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <Check className="w-4 h-4 flex-shrink-0" />}
            <span className="font-semibold">{actionAlert.message}</span>
          </div>
        )}

        {/* Sub-tab Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5" />
            <span>{isAr ? 'سجل حسابات المستخدمين' : 'User Accounts Registry'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'matrix'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAr ? 'مصفوفة الصلاحيات التفاعلية (32 مفتاح)' : 'Visual Permissions Matrix (32 Keys)'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {roles.length} {isAr ? 'أدوار' : 'Roles'}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: USERS ACCOUNTS REGISTRY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={isAr ? 'بحث بالاسم، البريد أو القسم...' : 'Search by name, email, department...'}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="all">{isAr ? 'كافة الأدوار الوظيفية' : 'All Roles'}</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{isAr ? r.nameAr : r.nameEn}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="all">{isAr ? 'كافة الحالات' : 'All Statuses'}</option>
                <option value="active">{isAr ? 'نشط (Active)' : 'Active'}</option>
                <option value="disabled">{isAr ? 'معطل (Disabled)' : 'Disabled'}</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <th className="py-3 px-4 font-bold text-start">{isAr ? 'المستخدم' : 'User'}</th>
                    <th className="py-3 px-4 font-bold text-start">{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                    <th className="py-3 px-4 font-bold text-start">{isAr ? 'الدور الوظيفي' : 'Role'}</th>
                    <th className="py-3 px-4 font-bold text-start">{isAr ? 'القسم' : 'Department'}</th>
                    <th className="py-3 px-4 font-bold text-center">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="py-3 px-4 font-bold text-center">{isAr ? 'آخر تسجيل دخول' : 'Last Login'}</th>
                    <th className="py-3 px-4 font-bold text-center w-48">{isAr ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map(user => {
                    const isCurrent = user.id === currentUser?.id;
                    const isDisabled = user.status === 'disabled';
                    const matchedRole = roles.find(r => r.id === user.roleId || r.id === user.role);

                    return (
                      <tr 
                        key={user.id} 
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                          isCurrent ? 'bg-red-50/20 dark:bg-red-950/10' : ''
                        }`}
                      >
                        {/* Name & Avatar */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isCurrent && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold">
                                    {isAr ? 'أنت' : 'You'}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {user.nameAr}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          <span className="font-mono text-[11px]">{user.email}</span>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3 px-4">
                          <span 
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-xs inline-block"
                            style={{ backgroundColor: matchedRole?.badgeColor || '#990000' }}
                          >
                            {isAr ? matchedRole?.nameAr || user.role : matchedRole?.nameEn || user.role}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {user.department || (isAr ? 'الإدارة العامة' : 'General Administration')}
                        </td>

                        {/* Status Toggle Switch */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            title={isAr ? 'انقر لتغيير الحالة' : 'Click to toggle status'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                              isDisabled
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            }`}
                          >
                            {isDisabled ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            <span>{isDisabled ? (isAr ? 'معطل' : 'Disabled') : (isAr ? 'نشط' : 'Active')}</span>
                          </button>
                        </td>

                        {/* Last Login */}
                        <td className="py-3 px-4 text-center text-[11px] text-slate-400">
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : (isAr ? 'اليوم' : 'Today')}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Switch active user (instant test) */}
                            <button
                              onClick={() => {
                                switchUser(user);
                                showAlert(isAr ? `تم التبديل إلى حساب: ${user.nameAr}` : `Switched active user to: ${user.name}`);
                              }}
                              title={isAr ? 'تسجيل الدخول بهذا المستخدم للتجربة' : 'Switch to this user session'}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset Password */}
                            {hasPermission('users.edit') && (
                              <button
                                onClick={() => {
                                  resetUserPassword(user.id);
                                  showAlert(isAr ? `تم إرسال إعادة تعيين كلمة المرور إلى ${user.email}` : `Password reset link sent to ${user.email}`);
                                }}
                                title={isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit User */}
                            {hasPermission('users.edit') && (
                              <button
                                onClick={() => handleOpenEditUser(user)}
                                title={isAr ? 'تعديل بيانات المستخدم' : 'Edit User Profile'}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL PERMISSIONS MATRIX (32 KEYS) */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 flex items-start justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  {isAr ? 'مصفوفة التحكم الدقيق بالأذونات: ' : 'Granular Permissions Matrix: '}
                </span>
                <span>
                  {isAr 
                    ? 'يمكن للمشرفين تفعيل أو تعطيل أي من الصلاحيات الـ 32 مباشرة لكل دور وظيفي. التغييرات تنعكس فورياً مع حماية كاملة لحساب المشرف العام.'
                    : 'Administrators can toggle any of the 32 discrete permissions directly per role. Changes apply in real time with self-protection for Super Admin.'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setRoleNameEn('');
                setRoleNameAr('');
                setRoleDescEn('');
                setRoleDescAr('');
                setRoleColor('#6D28D9');
                setSelectedRolePerms(['products.view', 'priorities.view', 'reports.view']);
                setIsRoleModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex-shrink-0"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isAr ? 'إضافة دور مخصص' : 'New Custom Role'}</span>
            </button>
          </div>

          {/* The Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <th className="py-3 px-4 font-bold text-start w-72">
                      {isAr ? 'مفتاح الصلاحية / الوظيفة' : 'Permission Key / Scope'}
                    </th>
                    {roles.map(role => (
                      <th key={role.id} className="py-3 px-4 font-bold text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span 
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: role.badgeColor }}
                          >
                            {isAr ? role.nameAr : role.nameEn}
                          </span>
                          <span className="text-[10px] font-normal text-slate-400">
                            {role.permissions.length} / {ALL_PERMISSIONS.length} {isAr ? 'مفعل' : 'enabled'}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(permissionCategories).map(([category, perms]) => (
                    <React.Fragment key={category}>
                      {/* Category Header Row */}
                      <tr className="bg-slate-50 dark:bg-slate-800/40">
                        <td colSpan={roles.length + 1} className="py-2 px-4 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                          {isAr ? `قسم: ${category}` : `Module: ${category}`}
                        </td>
                      </tr>

                      {/* Permission Rows */}
                      {perms.map(p => (
                        <tr key={p.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {isAr ? p.labelAr : p.labelEn}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {p.key}
                            </div>
                          </td>

                          {/* Checkboxes for each role */}
                          {roles.map(role => {
                            const isGranted = role.permissions.includes(p.key);
                            const isSuperAdminLocked = role.id === 'super_admin' && (p.key === 'users.edit' || p.key === 'users.assign_roles' || p.key === 'priorities.edit');

                            return (
                              <td key={role.id} className="py-2.5 px-4 text-center">
                                <button
                                  type="button"
                                  disabled={isSuperAdminLocked}
                                  onClick={() => handleToggleMatrixPermission(role, p.key)}
                                  className={`p-1 rounded-lg transition-transform ${
                                    isSuperAdminLocked
                                      ? 'opacity-80 cursor-not-allowed'
                                      : 'hover:scale-110 cursor-pointer'
                                  }`}
                                  title={isSuperAdminLocked ? (isAr ? 'صلاحية جوهرية للمشرف العام' : 'Core Super Admin Permission') : ''}
                                >
                                  {isGranted ? (
                                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-xs mx-auto">
                                      <Check className="w-3.5 h-3.5" />
                                    </span>
                                  ) : (
                                    <span className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 flex items-center justify-center mx-auto hover:border-slate-400">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                    </span>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingUser ? (isAr ? 'تعديل حساب المستخدم' : 'Edit User Account') : (isAr ? 'إضافة مستخدم جديد' : 'Create New User')}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? 'تحديد الاسم، البريد، الدور الوظيفي، والقسم' : 'Configure identity, role assignment, and department'}
                </p>
              </div>
              <button onClick={() => setIsUserModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الاسم (إنجليزي) *' : 'Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Eng. Dhiaa Al-Himyari"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الاسم (عربي)' : 'Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="م. ضياء الحميري"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'البريد الإلكتروني الرسمي *' : 'Official Email *'}
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="name@umcopharma.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الدور الوظيفي' : 'Role'}
                  </label>
                  <select
                    value={formRoleId}
                    onChange={(e) => {
                      setFormRoleId(e.target.value);
                      const baseRole: UserRole = e.target.value === 'super_admin' ? 'admin' : (e.target.value === 'viewer' ? 'viewer' : 'editor');
                      setFormRole(baseRole);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{isAr ? r.nameAr : r.nameEn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="active">{isAr ? 'نشط (Active)' : 'Active'}</option>
                    <option value="disabled">{isAr ? 'معطل (Disabled)' : 'Disabled'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'القسم أو الإدارة' : 'Department'}
                </label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  placeholder="Regulatory & Scientific Affairs"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm"
                >
                  {editingUser ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة المستخدم' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM ROLE MODAL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isAr ? 'إنشاء دور وظيفي مخصص' : 'Create Custom Role'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? 'حدد مسمى الدور الجديد ولون التمييز' : 'Specify role identity and accent color'}
                </p>
              </div>
              <button onClick={() => setIsRoleModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomRole} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'اسم الدور (إنجليزي) *' : 'Role Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={roleNameEn}
                    onChange={(e) => setRoleNameEn(e.target.value)}
                    placeholder="e.g. Commercial Director"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'اسم الدور (عربي)' : 'Role Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={roleNameAr}
                    onChange={(e) => setRoleNameAr(e.target.value)}
                    placeholder="مثال: المدير التجاري"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'الوصف' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={roleDescEn}
                  onChange={(e) => setRoleDescEn(e.target.value)}
                  placeholder="Brief responsibility description..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'لون شارة الدور' : 'Badge Color'}
                </label>
                <input
                  type="color"
                  value={roleColor}
                  onChange={(e) => setRoleColor(e.target.value)}
                  className="w-16 h-8 p-1 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm"
                >
                  {isAr ? 'إنشاء الدور' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;
