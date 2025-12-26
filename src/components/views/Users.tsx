import { useState } from 'react';
import { useUsers, useUpdateUserRole } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users as UsersIcon, Shield, ShoppingCart, Calculator, Package, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const roleLabels = {
  admin: 'مدير',
  sales: 'مبيعات',
  accountant: 'محاسب',
  warehouse: 'مستودع',
};

const roleIcons = {
  admin: Shield,
  sales: ShoppingCart,
  accountant: Calculator,
  warehouse: Package,
};

const roleColors = {
  admin: 'bg-red-500/10 text-red-500',
  sales: 'bg-blue-500/10 text-blue-500',
  accountant: 'bg-emerald-500/10 text-emerald-500',
  warehouse: 'bg-amber-500/10 text-amber-500',
};

export const Users = () => {
  const { data: users = [], isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const { user: currentUser, isAdmin } = useAuth();
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const handleRoleChange = (userId: string, role: 'admin' | 'sales' | 'accountant' | 'warehouse') => {
    updateRole.mutate({ userId, role }, {
      onSuccess: () => setEditingUser(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-primary" />
            إدارة المستخدمين
          </h1>
          <p className="text-muted-foreground">إدارة صلاحيات المستخدمين في النظام</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(roleLabels).map(([role, label]) => {
          const Icon = roleIcons[role as keyof typeof roleIcons];
          const count = users.filter(u => {
            const roles = u.user_roles as unknown as any[];
            return roles?.some?.((r: any) => r.role === role) || false;
          }).length;
          
          return (
            <Card key={role}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${roleColors[role as keyof typeof roleColors]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الصلاحية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ التسجيل</TableHead>
                {isAdmin() && <TableHead>الإجراءات</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const roles = user.user_roles as unknown as any[];
                const userRole = (roles?.[0]?.role || 'sales') as keyof typeof roleLabels;
                const Icon = roleIcons[userRole];
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[userRole]}>
                        <Icon className="h-3 w-3 mr-1" />
                        {roleLabels[userRole]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    {isAdmin() && (
                      <TableCell>
                        {user.user_id !== currentUser?.id && (
                          editingUser === user.user_id ? (
                            <Select
                              defaultValue={userRole}
                              onValueChange={(value) => 
                                handleRoleChange(user.user_id, value as any)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">مدير</SelectItem>
                                <SelectItem value="sales">مبيعات</SelectItem>
                                <SelectItem value="accountant">محاسب</SelectItem>
                                <SelectItem value="warehouse">مستودع</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUser(user.user_id)}
                            >
                              تغيير الصلاحية
                            </Button>
                          )
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
