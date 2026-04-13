// API 호출 헬퍼
async function apiRequest(method, url, data) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (data !== undefined) opts.body = JSON.stringify(data);

  const res = await fetch(url, opts);
  const json = await res.json();

  if (!json.success) {
    const err = new Error(json.error?.message || '오류가 발생했습니다.');
    err.code = json.error?.code;
    err.details = json.error?.details;
    throw err;
  }
  return json.data;
}

const apiGet    = (url)        => apiRequest('GET', url);
const apiPost   = (url, data)  => apiRequest('POST', url, data);
const apiPut    = (url, data)  => apiRequest('PUT', url, data);
const apiDelete = (url)        => apiRequest('DELETE', url);
const apiPatch  = (url, data)  => apiRequest('PATCH', url, data);
