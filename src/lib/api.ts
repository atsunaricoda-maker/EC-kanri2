// API呼び出しヘルパー関数

/**
 * 安全にfetchしてJSONをパースする
 * エラー時は空配列または指定したデフォルト値を返す
 */
export async function safeFetch<T>(url: string, defaultValue: T): Promise<T> {
  try {
    const res = await fetch(url)
    const contentType = res.headers.get('content-type')
    
    if (!res.ok) {
      console.error(`API error: ${url} returned ${res.status}`)
      return defaultValue
    }
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`API error: ${url} returned non-JSON content`)
      return defaultValue
    }
    
    const data = await res.json()
    return data as T
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error)
    return defaultValue
  }
}

/**
 * POSTリクエストを安全に実行
 */
export async function safePost<T>(
  url: string, 
  body: unknown, 
  options?: { method?: string }
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method: options?.method || 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    
    const contentType = res.headers.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text()
      console.error(`API error: ${url} returned non-JSON:`, text.substring(0, 200))
      return { 
        success: false, 
        error: 'サーバーエラーが発生しました。しばらく待ってから再試行してください。' 
      }
    }
    
    const data = await res.json()
    
    if (!res.ok) {
      return { success: false, error: data.error || '処理に失敗しました' }
    }
    
    return { success: true, data: data as T }
  } catch (error) {
    console.error(`POST error for ${url}:`, error)
    return { 
      success: false, 
      error: 'ネットワークエラーが発生しました。接続を確認してください。' 
    }
  }
}
