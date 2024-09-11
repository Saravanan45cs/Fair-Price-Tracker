import React, { useState, useEffect } from 'react';
import './ShopStatus.css';
import axios from 'axios';

const ShopStatus = () => {
  const [shops, setShops] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/shops');
        setShops(response.data);
      } catch (error) {
        console.error('Error fetching shop data:', error);
      }
    };

    fetchShops();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNotify = async (shopId) => {
    try {
      await axios.post(`http://localhost:5000/api/notify-shop/${shopId}`);
      setShops(shops.map(shop =>
        shop.shop_id === shopId ? { ...shop, notified: true } : shop
      ));
      alert('Notifications sent successfully');
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert('Failed to send notifications');
    }
  };

  const handleCall = async (shopId) => {
    try {
      await axios.post(`http://localhost:5000/api/call-shop/${shopId}`);
      setShops(shops.map(shop =>
        shop.shop_id === shopId ? { ...shop, callInitiated: true } : shop
      ));
      alert('Call initiated successfully');
    } catch (error) {
      console.error('Error initiating call:', error);
      alert('Failed to initiate call');
    }
  };

  const handleNotifyAll = async () => {
    const shopsToNotify = shops.filter(shop => !shop.notified && shop.status === 'Closed');
    if (shopsToNotify.length === 0) {
      alert('All relevant shops have already been notified.');
      return;
    }
  
    try {
      await Promise.all(shopsToNotify.map(shop => axios.post(`http://localhost:5000/api/notify-shop/${shop.shop_id}`)));
      setShops(shops.map(shop =>
        shop.notified ? shop : { ...shop, notified: true }
      ));
      alert('Notifications sent successfully');
    } catch (error) {
      console.error('Error sending notifications to all:', error);
      alert('Failed to send notifications');
    }
  };
  
  const handleCallAll = async () => {
    const shopsToCall = shops.filter(shop => !shop.callInitiated && shop.status === 'Closed');
    if (shopsToCall.length === 0) {
      alert('All relevant shops have already been called.');
      return;
    }
  
    try {
      await Promise.all(shopsToCall.map(shop => axios.post(`http://localhost:5000/api/call-shop/${shop.shop_id}`)));
      setShops(shops.map(shop =>
        shop.callInitiated ? shop : { ...shop, callInitiated: true }
      ));
      alert('Calls initiated successfully');
    } catch (error) {
      console.error('Error initiating calls to all:', error);
      alert('Failed to initiate calls');
    }
  };

  const handleDownloadReport = () => {
    const csvRows = [
      ['Shop Name', 'Taluk', 'Status', 'Opening Time', 'Notified', 'Call Initiated'],
      ...shops.map(shop => [
        shop.shop_name,
        shop.taluk,
        shop.status,
        shop.opening_time,
        shop.notified ? 'Yes' : 'No',
        shop.callInitiated ? 'Yes' : 'No'
      ])
    ];
  
    // Generate the file name with current date and time
    const now = new Date();
    const formattedDate = now.toISOString().replace(/:/g, '-'); // Replace colons with hyphens for compatibility
    const fileName = `shop_report_${formattedDate}.csv`;
  
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="shop-status-container">
      <h2>Shop Status</h2>
      <div className="current-time">Current Time: {currentTime.toLocaleTimeString()}</div>
      <div className="button-group">
        <button className="download-report" onClick={handleDownloadReport}>
          Download Report
        </button>
        <button className="notify-all-btn" onClick={handleNotifyAll}>
          Notify All
        </button>
        <button className="call-all-btn" onClick={handleCallAll}>
          Call All
        </button>
      </div>
      <table className="shop-table">
        <thead>
          <tr>
            <th>Shop Name</th>
            <th>Taluk</th>
            <th>Status</th>
            <th>Opening Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {shops.map(shop => (
            <tr key={shop.shop_id}>
              <td>{shop.shop_name}</td>
              <td>{shop.taluk}</td>
              <td>
                <span className={`status-circle ${shop.status === 'Open' ? 'status-open' : 'status-closed'}`}></span>
                {shop.status}
              </td>
              <td>{shop.opening_time}</td>
              <td>
                {shop.status === 'Closed' ? (
                  <div>
                    {!shop.notified ? (
                      <button className="notify-btn" onClick={() => handleNotify(shop.shop_id)}>
                        Notify
                      </button>
                    ) : (
                      <span className="notification-sent-text">Notification Sent</span>
                    )}
                    {!shop.callInitiated ? (
                      <button className="call-btn" onClick={() => handleCall(shop.shop_id)}>
                        Call
                      </button>
                    ) : (
                      <span className="call-initiated-text">Call Initiated</span>
                    )}
                  </div>
                ) : (
                  'Shop Open'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShopStatus;
