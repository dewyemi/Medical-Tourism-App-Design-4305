import React, { useState, useEffect } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getAllUsers, updateUserRole, deleteUser } from '../../services/adminService';
import { formatDate } from '../../utils/dataUtils';
import Modal from '../Modal';

const { FiUsers, FiEdit, FiTrash2, FiShield, FiMail, FiCalendar } = FiIcons;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      setUpdating(true);
      await updateUserRole(userId, newRole);
      await fetchUsers(); // Refresh the list
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to update user role');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setUpdating(true);
      await deleteUser(selectedUser.id);
      await fetchUsers(); // Refresh the list
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.profile?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.profile?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <SafeIcon icon={FiIcons.FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
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
              <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      {user.profile?.avatar_url ? (
                        <img
                          src={user.profile.avatar_url}
                          alt="Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <SafeIcon icon={FiUsers} className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.profile?.first_name && user.profile?.last_name
                          ? `${user.profile.first_name} ${user.profile.last_name}`
                          : user.email.split('@')[0]
                        }
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map(role => (
                      <span
                        key={role}
                        className={`px-2 py-1 text-xs rounded-full ${
                          role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : role === 'healthcare_provider'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {role.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <SafeIcon icon={FiEdit} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Role Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User Role</h3>
          
          {selectedUser && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">User: {selectedUser.email}</p>
              <p className="text-sm text-gray-600 mb-4">
                Current roles: {selectedUser.roles.join(', ')}
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Assign Role:
                </label>
                <div className="space-y-2">
                  {['patient', 'healthcare_provider', 'admin'].map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleUpdate(selectedUser.id, role)}
                      disabled={updating || selectedUser.roles.includes(role)}
                      className={`w-full text-left px-3 py-2 rounded-lg border ${
                        selectedUser.roles.includes(role)
                          ? 'bg-gray-100 text-gray-500 border-gray-300'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {role.replace('_', ' ')} {selectedUser.roles.includes(role) && '(Current)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="bg-white rounded-xl p-6">
          <div className="text-center">
            <SafeIcon icon={FiTrash2} className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={updating}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400"
              >
                {updating ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;