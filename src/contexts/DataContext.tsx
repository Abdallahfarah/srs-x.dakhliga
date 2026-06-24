import React, { createContext, useContext } from "react";
import { Shop, Payment, User, AuditLog, Dagmo, Seedka, ShopStatus, PaymentStatus, UserStatus } from "../types";
import { supabase } from "../lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface DataContextType {
  shops: Shop[];
  payments: Payment[];
  usersList: User[];
  auditLogs: AuditLog[];
  dagmos: Dagmo[];
  seedkas: Seedka[];
  // Metrics
  metrics: {
    totalRevenue: number;
    totalShops: number;
    totalUsers: number;
    totalPaymentsProc: number;
    pendingRevenue: number;
    paidShopsMonth: number;
    unpaidShopsMonth: number;
    monthlyRevenue: number;
  };
  handleAddShop: (newShop: Omit<Shop, "id" | "createdDate" | "createdBy">, actorEmail: string) => Promise<void>;
  handleDeleteShop: (id: string) => Promise<void>;
  handleRestoreShop: (id: string) => Promise<void>;
  handleAddPayment: (payment: Omit<Payment, "id" | "isLocked" | "auditTrailId">) => Promise<void>;
  handleModifyPayment: (id: string, updated: Partial<Payment>) => Promise<void>;
  handleDeletePayment: (id: string) => Promise<void>;
  handleAddUser: (newUser: any) => Promise<void>;
  handleToggleUserStatus: (id: string) => Promise<void>;
  handleUpdateUser: (id: string, updated: Partial<User>) => Promise<void>;
  handleUpdateCurrentUser: (userId: string, updated: Partial<User>) => Promise<void>;
  handleResetPassword: (userId: string, newPassword: string) => Promise<void>;
  handleLogAudit: (action: string, entityType: string, entityId: string) => Promise<void>;
  // Dagmo CRUD
  handleAddDagmo: (name: string, status: string) => Promise<void>;
  handleUpdateDagmo: (id: string, name: string, status: string) => Promise<void>;
  handleDeleteDagmo: (id: string) => Promise<{ error?: string }>;
  // Seedka CRUD
  handleAddSeedka: (dagmoId: string, name: string, status: string) => Promise<void>;
  handleUpdateSeedka: (id: string, name: string, status: string) => Promise<void>;
  handleDeleteSeedka: (id: string) => Promise<{ error?: string }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // 1. Fetch Dagmos
  const { data: dagmos = [] } = useQuery<Dagmo[]>({
    queryKey: ['dagmos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('dagmos').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data.map((d: any) => ({
        id: d.id,
        code: d.id.split('-')[0].toUpperCase(),
        name: d.name,
        status: d.status || 'Active',
        createdAt: d.created_at || new Date().toISOString(),
      }));
    }
  });

  // 2. Fetch Seedkas
  const { data: seedkas = [] } = useQuery<Seedka[]>({
    queryKey: ['seedkas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('seedkas').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data.map((s: any) => ({
        id: s.id,
        code: s.id.split('-')[0].toUpperCase(),
        dagmoId: s.dagmo_id,
        name: s.name,
        status: s.status || 'Active',
        createdAt: s.created_at || new Date().toISOString(),
      }));
    }
  });

  // 3. Fetch Shops — resilient query with join fallback
  const { data: shops = [] as Shop[] } = useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: async () => {
      // Try with profiles join first
      let result = await supabase.from('shops').select('*, profiles!shops_created_by_fkey(email)');
      
      // If join fails (FK path issue), fall back to plain select
      if (result.error) {
        console.warn('[DataContext] Shops join query failed, using fallback:', result.error.message);
        result = await supabase.from('shops').select('*');
      }

      if (result.error) throw result.error;

      return (result.data || []).map((s: any) => ({
        id: s.id,
        code: "SHP-" + s.id.split('-')[0].toUpperCase(),
        name: s.name,
        dagmoId: s.dagmo_id,
        seedkaId: s.seedka_id,
        ownerName: s.owner_name || "",
        tNumber: s.t_number || "",
        phone: s.phone || "",
        type: s.shop_type || "Retail",
        status: s.status as ShopStatus,
        createdDate: new Date(s.created_at).toLocaleDateString(),
        createdBy: s.profiles?.email || 'Unknown',
        deletedAt: s.deleted_at
      })) as Shop[];
    }
  });

  // 4. Fetch Payments — resilient query with join fallback
  const { data: payments = [] as Payment[] } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      let result = await supabase
        .from('payments')
        .select(`
          *,
          profiles!payments_created_by_fkey(email),
          shops(
            name,
            dagmo_id,
            seedka_id,
            dagmos(name),
            seedkas(name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (result.error) {
        console.warn('[DataContext] Payments join query failed, using fallback:', result.error.message);
        result = await supabase.from('payments').select('*');
      }

      if (result.error) throw result.error;

      return (result.data || []).map((p: any) => ({
        id: p.id,
        shopId: p.shop_id,
        amount: p.amount,
        dagmoId: p.shops?.dagmo_id || '',
        seedkaId: p.shops?.seedka_id || '',
        dagmoName: p.shops?.dagmos?.name || 'Unknown',
        seedkaName: p.shops?.seedkas?.name || 'Unknown',
        month: p.month,
        year: p.year,
        status: p.status as PaymentStatus,
        paidDate: p.paid_date || new Date(p.created_at).toLocaleDateString(),
        notes: p.notes || "",
        createdBy: p.profiles?.email || 'Unknown',
        createdById: p.created_by,
        isLocked: false,
        auditTrailId: 'AUD-' + p.id.split('-')[0].toUpperCase()
      })) as Payment[];
    }
  });

  // 5. Fetch Users
  const { data: usersList = [] as User[] } = useQuery<User[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data.map((u: any) => ({
        id: u.id,
        name: u.full_name,
        username: u.username || "",
        email: u.email,
        role: u.role,
        status: u.status,
        createdDate: new Date(u.created_at).toLocaleDateString(),
        phone: u.phone || "",
        avatar: ""
      })) as User[];
    }
  });

  // 6. Fetch Audit Logs — resilient query with join fallback
  const { data: auditLogs = [] } = useQuery<AuditLog[]>({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      let result = await supabase.from('audit_logs').select('*, profiles!audit_logs_user_id_fkey(email)');
      
      if (result.error) {
        console.warn('[DataContext] Audit logs join query failed, using fallback:', result.error.message);
        result = await supabase.from('audit_logs').select('*');
      }

      if (result.error) throw result.error;

      return (result.data || []).map((l: any) => ({
        id: l.id,
        timestamp: new Date(l.created_at).toISOString(),
        action: l.action,
        entityInfo: `${l.entity_type} ${l.entity_id}`,
        userEmail: l.profiles?.email || 'System',
        ipAddress: 'System'
      }));
    }
  });

  // ========== SHOP MUTATIONS ==========
  const addShopMutation = useMutation({
    mutationFn: async (newShop: any) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('shops').insert({
        name: newShop.name,
        owner_name: newShop.ownerName,
        t_number: newShop.tNumber,
        phone: newShop.phone,
        dagmo_id: newShop.dagmoId,
        seedka_id: newShop.seedkaId,
        shop_type: newShop.type,
        status: newShop.status,
        created_by: user.user?.id
      }).select().single();
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: user.user?.id,
        action: 'CREATE_SHOP',
        entity_type: 'SHOP',
        entity_id: data.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    }
  });

  const deleteShopMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from('shops').update({
        deleted_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: user.user?.id,
        action: 'DELETE_SHOP',
        entity_type: 'SHOP',
        entity_id: id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    }
  });

  const restoreShopMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from('shops').update({
        deleted_at: null
      }).eq('id', id);
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: user.user?.id,
        action: 'RESTORE_SHOP',
        entity_type: 'SHOP',
        entity_id: id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    }
  });

  // ========== PAYMENT MUTATIONS ==========
  const addPaymentMutation = useMutation({
    mutationFn: async (newPayment: any) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('payments').insert({
        shop_id: newPayment.shopId,
        amount: newPayment.amount,
        month: newPayment.month,
        year: newPayment.year,
        status: newPayment.status,
        paid_date: newPayment.paidDate,
        notes: newPayment.notes,
        created_by: user.user?.id
      }).select().single();
      if (error) throw error;
      await supabase.from('audit_logs').insert({
        user_id: user.user?.id,
        action: 'CREATE_PAYMENT',
        entity_type: 'PAYMENT',
        entity_id: data.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    }
  });

  const modifyPaymentMutation = useMutation({
    mutationFn: async ({ id, updated }: { id: string, updated: Partial<Payment> }) => {
      const { data: user } = await supabase.auth.getUser();
      const updatePayload: any = {};
      if (updated.status !== undefined) updatePayload.status = updated.status;
      if (updated.amount !== undefined) updatePayload.amount = updated.amount;
      if (updated.notes !== undefined) updatePayload.notes = updated.notes;
      if (updated.paidDate !== undefined) updatePayload.paid_date = updated.paidDate;
      if (updated.isLocked !== undefined) updatePayload.is_locked = updated.isLocked;
      if (updated.lockedDate !== undefined) updatePayload.locked_date = updated.lockedDate;

      const { error } = await supabase.from('payments').update(updatePayload).eq('id', id);
      if (error) throw error;

      // Determine audit action
      let action = 'MODIFY_PAYMENT';
      if (updated.isLocked === true) action = 'LOCK_PAYMENT';
      if (updated.isLocked === false) action = 'UNLOCK_PAYMENT';

      await supabase.from('audit_logs').insert({
        user_id: user.user?.id,
        action,
        entity_type: 'PAYMENT',
        entity_id: id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    }
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: user.user?.id,
        action: 'DELETE_PAYMENT',
        entity_type: 'PAYMENT',
        entity_id: id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    }
  });

  // ========== DAGMO MUTATIONS ==========
  const handleAddDagmo = async (name: string, status: string) => {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('dagmos').insert({ name, status }).select().single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.user?.id,
      action: 'CREATE_DAGMO',
      entity_type: 'DAGMO',
      entity_id: data.id
    });

    queryClient.invalidateQueries({ queryKey: ['dagmos'] });
    queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
  };

  const handleUpdateDagmo = async (id: string, name: string, status: string) => {
    const { error } = await supabase.from('dagmos').update({ name, status }).eq('id', id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['dagmos'] });
  };

  const handleDeleteDagmo = async (id: string): Promise<{ error?: string }> => {
    // Check if dagmo has seedkas
    const { data: existingSeedkas } = await supabase.from('seedkas').select('id').eq('dagmo_id', id);
    if (existingSeedkas && existingSeedkas.length > 0) {
      return { error: 'Cannot delete Dagmo with existing Seedkas.' };
    }
    const { error } = await supabase.from('dagmos').delete().eq('id', id);
    if (error) return { error: error.message };
    queryClient.invalidateQueries({ queryKey: ['dagmos'] });
    return {};
  };

  // ========== SEEDKA MUTATIONS ==========
  const handleAddSeedka = async (dagmoId: string, name: string, status: string) => {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('seedkas').insert({ dagmo_id: dagmoId, name, status }).select().single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.user?.id,
      action: 'CREATE_SEEDKA',
      entity_type: 'SEEDKA',
      entity_id: data.id
    });

    queryClient.invalidateQueries({ queryKey: ['seedkas'] });
    queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
  };

  const handleUpdateSeedka = async (id: string, name: string, status: string) => {
    const { error } = await supabase.from('seedkas').update({ name, status }).eq('id', id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['seedkas'] });
  };

  const handleDeleteSeedka = async (id: string): Promise<{ error?: string }> => {
    // Check if seedka has shops
    const { data: existingShops } = await supabase.from('shops').select('id').eq('seedka_id', id);
    if (existingShops && existingShops.length > 0) {
      return { error: 'Cannot delete Seedka with existing Shops.' };
    }
    const { error } = await supabase.from('seedkas').delete().eq('id', id);
    if (error) return { error: error.message };
    queryClient.invalidateQueries({ queryKey: ['seedkas'] });
    return {};
  };

  // ========== HANDLER WRAPPERS ==========
  const handleAddShop = async (newShop: Omit<Shop, "id" | "createdDate" | "createdBy">, actorEmail: string) => {
    await addShopMutation.mutateAsync(newShop);
  };

  const handleDeleteShop = async (id: string) => {
    await deleteShopMutation.mutateAsync(id);
  };

  const handleRestoreShop = async (id: string) => {
    await restoreShopMutation.mutateAsync(id);
  };

  const handleAddPayment = async (newPayment: Omit<Payment, "id" | "isLocked" | "auditTrailId">) => {
    await addPaymentMutation.mutateAsync(newPayment);
  };

  const handleModifyPayment = async (id: string, updated: Partial<Payment>) => {
    await modifyPaymentMutation.mutateAsync({ id, updated });
  };

  const handleDeletePayment = async (id: string) => {
    await deletePaymentMutation.mutateAsync(id);
  };

  const handleAddUser = async (newUser: any) => {
    const { data: adminUser } = await supabase.auth.getUser();
    
    // Note: In client-side, signUp creates the Auth record.
    // Internal email is generated automatically from username
    const internalEmail = `${newUser.username.toLowerCase()}@srs.local`;
    
    const { data, error } = await supabase.auth.signUp({
      email: internalEmail,
      password: newUser.password || 'TempPassword123!',
      options: {
        data: {
          full_name: newUser.name,
          username: newUser.username.toLowerCase(),
          role: newUser.role
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('audit_logs').insert({
        user_id: adminUser.user?.id,
        action: 'CREATE_USER',
        entity_type: 'PROFILE',
        entity_id: data.user.id
      });
    }

    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
  };

  const handleToggleUserStatus = async (id: string) => {
    const user = usersList.find(u => u.id === id);
    if (!user) return;
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    const { error } = await supabase.from('profiles').update({
      status: newStatus
    }).eq('id', id);
    if (error) throw error;

    const { data: admin } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert({
      user_id: admin.user?.id,
      action: newStatus === 'Suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
      entity_type: 'PROFILE',
      entity_id: id
    });

    queryClient.invalidateQueries({ queryKey: ['profiles'] });
  };

  const handleUpdateUser = async (id: string, updated: Partial<User>) => {
    const { error } = await supabase.from('profiles').update({
      full_name: updated.name,
      username: updated.username,
      phone: updated.phone,
      role: updated.role,
      status: updated.status
    }).eq('id', id);
    if (error) throw error;

    const { data: admin } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert({
      user_id: admin.user?.id,
      action: 'UPDATE_USER',
      entity_type: 'PROFILE',
      entity_id: id
    });

    queryClient.invalidateQueries({ queryKey: ['profiles'] });
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    // Supabase Admin API: updateUserById requires service role or admin privileges
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });
    if (error) throw error;

    const { data: admin } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert({
      user_id: admin.user?.id,
      action: 'PASSWORD_RESET',
      entity_type: 'PROFILE',
      entity_id: userId
    });

    queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
  };

  const handleLogAudit = async (action: string, entityType: string, entityId: string) => {
    const { data: admin } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert({
      user_id: admin.user?.id,
      action,
      entity_type: entityType,
      entity_id: entityId
    });
    queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
  };

  const handleUpdateCurrentUser = async (userId: string, updated: Partial<User>) => {
    const { error } = await supabase.from('profiles').update({
      full_name: updated.name,
      phone: updated.phone,
      email: updated.email
    }).eq('id', userId);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
  };

  // 7. Compute Metrics
  const activeShops = shops.filter(s => !s.deletedAt);
  
  const metrics = {
    totalRevenue: payments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0),
    totalShops: activeShops.length,
    totalUsers: usersList.length,
    totalPaymentsProc: payments.length,
    pendingRevenue: payments
      .filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + p.amount, 0),
    paidShopsMonth: activeShops.filter(s => 
      payments.some(p => p.shopId === s.id && p.month === new Date().toLocaleString('en-US', { month: 'long' }) && p.year === new Date().getFullYear().toString() && p.status === 'Paid')
    ).length,
    unpaidShopsMonth: activeShops.filter(s => 
      !payments.some(p => p.shopId === s.id && p.month === new Date().toLocaleString('en-US', { month: 'long' }) && p.year === new Date().getFullYear().toString() && p.status === 'Paid')
    ).length,
    monthlyRevenue: payments
      .filter(p => p.status === 'Paid' && p.month === new Date().toLocaleString('en-US', { month: 'long' }) && p.year === new Date().getFullYear().toString())
      .reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <DataContext.Provider value={{
      shops, payments, usersList, auditLogs, dagmos, seedkas, metrics,
      handleAddShop, handleDeleteShop, handleRestoreShop, 
      handleAddPayment, handleModifyPayment, handleDeletePayment,
      handleAddUser, handleToggleUserStatus, handleUpdateUser, handleLogAudit, handleResetPassword, handleUpdateCurrentUser,
      handleAddDagmo, handleUpdateDagmo, handleDeleteDagmo,
      handleAddSeedka, handleUpdateSeedka, handleDeleteSeedka,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
