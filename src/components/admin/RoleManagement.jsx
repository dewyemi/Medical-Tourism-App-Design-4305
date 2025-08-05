import { useState, useEffect } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getAllPermissions, getRolePermissions, updateRolePermissions } from '../../services/adminService';

const { FiShield, FiCheck, FiX } = FiIcons;

const RoleManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const roles = ['patient', 'healthcare_provider', 'admin'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [permissionsData, ...rolePermissionsData] = await Promise.all([
        getAllPermissions(),
        ...roles.map(role => getRolePermissions(role))
      ]);

      setPermissions(permissionsData);
      
      const rolePermissionsMap = {};
      roles.forEach((role, index) => {
        rolePermissionsMap[role] = rolePermissionsData[index].map(p => p.name);
      });
      
      setRolePermissions(rolePermissionsMap);
      setError(null);
    } catch (err) {
      setError('Failed to load permissions data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (role, permissionName) => {
    try {
      setUpdating(true);
      const currentPermissions = rolePermissions[role] || [];
      const hasPermission = currentPermissions.includes(permissionName);
      
      await updateRolePermissions(role, permissionName, !hasPermission);
      
      // Update local state
      setRolePermissions(prev => ({
        ...prev,
        [role]: hasPermission
          ? prev[role].filter(p => p !== permissionName)
          : [...(prev[role] || []), permissionName]
      }));
    } catch (err) {
      setError('Failed to update permissions');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Roles & Permissions</h2>
        <p className="text-gray-600">Manage what each role can do in the system</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Permission</th>
              {roles.map(role => (
                <th key={role} className="text-center py-3 px-4 font-medium text-gray-700">
                  <div className="flex flex-col items-center">
                    <SafeIcon icon={FiShield} className="w-5 h-5 mb-1" />
                    <span className="capitalize">{role.replace('_', ' ')}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map(permission => (
              <tr key={permission.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{permission.name}</p>
                    <p className="text-sm text-gray-500">{permission.description}</p>
                  </div>
                </td>
                {roles.map(role => {
                  const hasPermission = rolePermissions[role]?.includes(permission.name);
                  return (
                    <td key={role} className="py-3 px-4 text-center">
                      <button
                        onClick={() => togglePermission(role, permission.name)}
                        disabled={updating}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          hasPermission
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <SafeIcon icon={hasPermission ? FiCheck : FiX} className="w-4 h-4" />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Role Descriptions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Patient:</strong> Regular users who can book treatments and manage their profile</li>
          <li><strong>Healthcare Provider:</strong> Medical professionals who can manage bookings and view analytics</li>
          <li><strong>Admin:</strong> System administrators with full access to all features</li>
        </ul>
      </div>
    </div>
  );
};

export default RoleManagement;