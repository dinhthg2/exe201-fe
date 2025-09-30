'use client';

import { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusCircleIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import api from '../../../lib/api';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  reference?: string;
}

interface WalletStats {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  transactionCount: number;
}

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletStats, setWalletStats] = useState<WalletStats>({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    transactionCount: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100000);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // Fetch wallet summary
      const summaryResponse = await api.get('/wallet/summary');
      const summaryData = summaryResponse.data.data;
      setWalletStats({
        balance: summaryData.balance || 0,
        monthlyIncome: summaryData.monthlyIncome || 0,
        monthlyExpense: summaryData.monthlyExpense || 0,
        transactionCount: summaryData.transactionCount || 0
      });

      // Fetch recent transactions
      const transactionsResponse = await api.get('/wallet/transactions', {
        params: { page: 1, limit: 10 }
      });
      const transactionsData = transactionsResponse.data.data;
      setTransactions(transactionsData.transactions || []);
      setTotalPages(transactionsData.pagination?.total || 1);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Không thể tải dữ liệu ví');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = (page: number) => {
    setCurrentPage(page);
    setLoading(true);

    // Fetch transactions for the specific page
    api.get('/wallet/transactions', {
      params: { page, limit: 10 }
    }).then(response => {
      const transactionsData = response.data.data;
      setTransactions(transactionsData.transactions || []);
      setTotalPages(transactionsData.pagination?.total || 1);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching transactions:', error);
      toast.error('Không thể tải lịch sử giao dịch');
      setLoading(false);
    });
  };

  const handleTopUp = async () => {
    setLoading(true);
    try {
      const response = await api.post('/wallet/top-up', {
        amount: topUpAmount,
        method: 'bank_transfer'
      });

      if (response.data.success) {
        toast.success('Nạp tiền thành công!');
        await fetchWalletData(); // Refresh data
        setShowTopUpModal(false);
        setTopUpAmount(100000);
      }
    } catch (error: any) {
      console.error('Error topping up:', error);
      toast.error(error?.response?.data?.message || 'Không thể nạp tiền');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <PlusCircleIcon className="h-5 w-5 text-green-500" />;
      case 'payment':
        return <CreditCardIcon className="h-5 w-5 text-red-500" />;
      case 'transfer_in':
        return <ArrowDownIcon className="h-5 w-5 text-green-500" />;
      case 'transfer_out':
        return <ArrowUpIcon className="h-5 w-5 text-red-500" />;
      default:
        return <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const TopUpModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nạp tiền vào ví</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
            <div className="relative">
              <input
                type="number"
                min="10000"
                step="10000"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₫</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[100000, 200000, 500000, 1000000].map((amount) => (
              <button
                key={amount}
                onClick={() => setTopUpAmount(amount)}
                className={`px-3 py-1.5 rounded-md border ${
                  topUpAmount === amount
                    ? 'bg-blue-50 border-blue-400 text-blue-600'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                {formatCurrency(amount)}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="bank_transfer">Chuyển khoản ngân hàng</option>
              <option value="momo">Ví điện tử MoMo</option>
              <option value="zalopay">ZaloPay</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            variant="outline"
            onClick={() => setShowTopUpModal(false)}
          >
            Hủy
          </Button>

          <Button
            onClick={handleTopUp}
            loading={loading}
            disabled={topUpAmount < 10000}
          >
            Nạp tiền
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading && !transactions.length) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <Breadcrumb />

        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ví của tôi</h1>
            <p className="text-gray-600">Quản lý và theo dõi tài chính của bạn</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              leftIcon={<PlusCircleIcon className="h-5 w-5" />}
              onClick={() => setShowTopUpModal(true)}
            >
              Nạp tiền
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Tổng quan
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('transactions')}
            >
              Lịch sử giao dịch
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Wallet stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100"></div>
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <CreditCardIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Số dư hiện tại</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mt-3">{formatCurrency(walletStats.balance)}</p>
                  <button className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
                    <span>Lịch sử giao dịch</span>
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </Card>

              <Card>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <ArrowDownIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Thu nhập tháng này</span>
                </div>
                <p className="text-3xl font-bold text-green-600 mt-3">{formatCurrency(walletStats.monthlyIncome)}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {walletStats.transactionCount} giao dịch trong tháng 9
                </p>
              </Card>

              <Card>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                    <ArrowUpIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Chi tiêu tháng này</span>
                </div>
                <p className="text-3xl font-bold text-red-600 mt-3">{formatCurrency(walletStats.monthlyExpense)}</p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{ width: `${walletStats.monthlyIncome > 0 ? (walletStats.monthlyExpense / walletStats.monthlyIncome) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {walletStats.monthlyIncome > 0 ? Math.round((walletStats.monthlyExpense / walletStats.monthlyIncome) * 100) : 0}% so với thu nhập
                </p>
              </Card>
            </div>

            {/* Recent transactions */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Giao dịch gần đây</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('transactions')}
                  rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                >
                  Xem tất cả
                </Button>
              </div>

              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2.5 rounded-full bg-gray-100">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString('vi-VN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`font-medium ${getTransactionColor(transaction.amount)}`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Lịch sử giao dịch</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Lọc:</span>
                  <select className="p-2 border border-gray-300 rounded-lg text-sm">
                    <option value="all">Tất cả</option>
                    <option value="topup">Nạp tiền</option>
                    <option value="payment">Thanh toán</option>
                    <option value="transfer">Chuyển tiền</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giao dịch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã giao dịch
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số tiền
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-1.5 rounded-full bg-gray-100">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString('vi-VN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(transaction.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{transaction.reference}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${getTransactionColor(transaction.amount)}`}>
                            {formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status === 'completed' ? 'Thành công' :
                             transaction.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 mt-4">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Hiển thị <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> đến <span className="font-medium">{Math.min(currentPage * 10, walletStats.transactionCount)}</span> của{' '}
                      <span className="font-medium">{walletStats.transactionCount}</span> giao dịch
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => fetchTransactions(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => fetchTransactions(page)}
                          aria-current={page === currentPage ? "page" : undefined}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            page === currentPage
                              ? "z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => fetchTransactions(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {showTopUpModal && <TopUpModal />}
    );