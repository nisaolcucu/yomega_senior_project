const axios = require('axios');

// ✅ OLLAMA AYARLARI
const OLLAMA_API_URL = 'http://localhost:11434/api/chat';
const MODEL_NAME = 'llama3.2';

// Turkish character normalization
const normalizeTurkish = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c');
};

// Synonym map
const synonymMap = {
  'haberler': ['haber', 'duyuru', 'news', 'announcement'],
  'haber': ['haberler', 'duyuru', 'news'],
  'yönetim': ['kurul', 'board', 'yonetim', 'yönetim kurulu'],
  'kurul': ['yönetim', 'board', 'yonetim kurulu'],
  'aidat': ['dues', 'odeme', 'payment', 'ücret'],
  'üyelik': ['uye', 'membership', 'kayit', 'registration'],
  'program': ['etkinlik', 'event', 'seminer', 'workshop'],
  'kaynak': ['resource', 'materyal', 'dosya', 'file'],
  'denetim': ['denetim kurulu', 'audit', 'kontrol'],
  'başkan': ['president', 'chairman', 'yonetici']
};

// Expand query
const expandQuery = (query) => {
  const normalized = normalizeTurkish(query);
  const terms = normalized.split(/\s+/);
  const expanded = new Set([normalized]);

  terms.forEach(term => {
    if (synonymMap[term]) {
      synonymMap[term].forEach(syn => expanded.add(syn));
    }
  });

  Object.keys(synonymMap).forEach(key => {
    if (normalized.includes(key)) {
      synonymMap[key].forEach(syn => expanded.add(syn));
    }
  });

  return Array.from(expanded).join(' ');
};

// Get group label
const getGroupLabel = (position) => {
  const positionLower = position?.toLowerCase() || '';

  if (['başkan', 'başkan yardımcısı', 'genel sekreter', 'sayman', 'üye'].includes(positionLower)) {
    return 'Yönetim Kurulu Asil';
  }
  if (positionLower === 'yedek üye') {
    return 'Yönetim Kurulu Yedek';
  }
  if (['denetim kurulu başkanı', 'denetim kurulu üyesi'].includes(positionLower)) {
    return 'Denetim Kurulu Asil';
  }
  if (positionLower === 'denetim kurulu yedek üyesi') {
    return 'Denetim Kurulu Yedek';
  }
  if (positionLower === 'kurucu üye') {
    return 'Kurucu Üye';
  }

  return 'Yönetim Kurulu';
};

// Search site content
// ✅ GELİŞTİRİLMİŞ ARAMA FONKSİYONU
const searchSiteContent = async (query, user) => {
  const News = require('../models/News');
  const Program = require('../models/Program');
  const Resource = require('../models/Resource');
  const BoardMember = require('../models/BoardMember');

  let searchResults = [];
  const normalizedQuery = normalizeTurkish(query);
  const expandedQuery = expandQuery(query);

  // ✅ Arama terimlerini ayır (daha akıllı arama için)
  const searchTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 2);
  console.log('🔍 Arama terimleri:', searchTerms);

  // ✅ Her terim için regex pattern oluştur
  const patterns = searchTerms.map(term => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'i');
  });

  try {
    // ✅ HABERLER - Geliştirilmiş arama
    let news = [];
    try {
      // Önce text search dene
      news = await News.find({
        isActive: true,
        $text: { $search: expandedQuery }
      })
        .select('title summary content category publishDate slug')
        .sort({ score: { $meta: 'textScore' }, publishDate: -1 })
        .limit(10);

      console.log(`📰 Text search: ${news.length} haber`);
    } catch (textError) {
      console.log('⚠️  Text index yok, regex kullanılıyor');
    }

    // Text search sonuç vermediyse VEYA az sonuç verdiyse regex dene
    if (news.length < 3) {
      const regexNews = await News.find({
        isActive: true,
        $or: searchTerms.map(term => ({
          $or: [
            { title: new RegExp(term, 'i') },
            { content: new RegExp(term, 'i') },
            { summary: new RegExp(term, 'i') },
            { category: new RegExp(term, 'i') }
          ]
        }))
      })
        .select('title summary content category publishDate slug')
        .sort({ publishDate: -1 })
        .limit(10);

      // Duplicate kontrolü ile birleştir
      regexNews.forEach(item => {
        if (!news.find(n => n._id.toString() === item._id.toString())) {
          news.push(item);
        }
      });

      console.log(`📰 Regex search: ${regexNews.length} haber eklendi`);
    }

    // Relevance score hesapla (kaç terim eşleşiyor)
    news.forEach(item => {
      let score = 0;
      const itemText = `${item.title} ${item.summary} ${item.content}`.toLowerCase();
      searchTerms.forEach(term => {
        if (itemText.includes(term)) score++;
      });
      item.relevanceScore = score;
    });

    // Score'a göre sırala
    news.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    news.forEach(item => {
      searchResults.push({
        type: 'news',
        id: item._id,
        title: item.title,
        snippet: item.summary || item.content?.substring(0, 150),
        url: `/haberler/${item.slug || item._id}`,
        score: item.relevanceScore || 0
      });
    });

    // ✅ PROGRAMLAR - Geliştirilmiş arama
    let programs = [];
    try {
      programs = await Program.find({
        status: 'yayınlandı',
        $text: { $search: expandedQuery }
      })
        .select('title description shortDescription speaker dateTime category')
        .sort({ score: { $meta: 'textScore' }, dateTime: 1 })
        .limit(10);

      console.log(`📅 Text search: ${programs.length} program`);
    } catch (textError) {
      console.log('⚠️  Program text index yok');
    }

    if (programs.length < 3) {
      const regexPrograms = await Program.find({
        status: 'yayınlandı',
        $or: searchTerms.map(term => ({
          $or: [
            { title: new RegExp(term, 'i') },
            { description: new RegExp(term, 'i') },
            { shortDescription: new RegExp(term, 'i') },
            { category: new RegExp(term, 'i') },
            { speaker: new RegExp(term, 'i') }
          ]
        }))
      })
        .select('title description shortDescription speaker dateTime category')
        .sort({ dateTime: 1 })
        .limit(10);

      regexPrograms.forEach(item => {
        if (!programs.find(p => p._id.toString() === item._id.toString())) {
          programs.push(item);
        }
      });

      console.log(`📅 Regex search: ${regexPrograms.length} program eklendi`);
    }

    programs.forEach(item => {
      let score = 0;
      const itemText = `${item.title} ${item.description} ${item.shortDescription} ${item.category}`.toLowerCase();
      searchTerms.forEach(term => {
        if (itemText.includes(term)) score++;
      });

      searchResults.push({
        type: 'program',
        id: item._id,
        title: item.title,
        snippet: item.shortDescription || item.description?.substring(0, 150),
        url: `/program-konusmacilar/${item._id}`,
        score: score
      });
    });

    // ✅ KAYNAKLAR - Geliştirilmiş arama
    const accessFilter = !user
      ? { access: 'public' }
      : (!user.isAdmin && user.role !== 'admin')
        ? { access: { $in: ['public', 'members'] } }
        : {};

    let resources = [];
    try {
      resources = await Resource.find({
        isActive: true,
        ...accessFilter,
        $text: { $search: expandedQuery }
      })
        .select('title description category type tags publishDate')
        .sort({ score: { $meta: 'textScore' }, publishDate: -1 })
        .limit(10);

      console.log(`📚 Text search: ${resources.length} kaynak`);
    } catch (textError) {
      console.log('⚠️  Resource text index yok');
    }

    if (resources.length < 3) {
      const regexResources = await Resource.find({
        isActive: true,
        ...accessFilter,
        $or: searchTerms.map(term => ({
          $or: [
            { title: new RegExp(term, 'i') },
            { description: new RegExp(term, 'i') },
            { category: new RegExp(term, 'i') },
            { tags: new RegExp(term, 'i') }
          ]
        }))
      })
        .select('title description category type tags publishDate')
        .sort({ publishDate: -1 })
        .limit(10);

      regexResources.forEach(item => {
        if (!resources.find(r => r._id.toString() === item._id.toString())) {
          resources.push(item);
        }
      });

      console.log(`📚 Regex search: ${regexResources.length} kaynak eklendi`);
    }

    resources.forEach(item => {
      let score = 0;
      const itemText = `${item.title} ${item.description} ${item.category} ${item.tags?.join(' ')}`.toLowerCase();
      searchTerms.forEach(term => {
        if (itemText.includes(term)) score++;
      });

      searchResults.push({
        type: 'resource',
        id: item._id,
        title: item.title,
        snippet: item.description?.substring(0, 150),
        url: `/kaynaklar/${item._id}`,
        score: score
      });
    });

    // ✅ YÖNETİM KURULU
    let boardMembers = [];
    try {
      boardMembers = await BoardMember.find({
        isActive: true,
        isPublic: true,
        $text: { $search: expandedQuery }
      })
        .select('name position bio displayOrder')
        .sort({ score: { $meta: 'textScore' }, displayOrder: 1 })
        .limit(50);
    } catch (textError) {
      boardMembers = await BoardMember.find({
        isActive: true,
        isPublic: true,
        $or: searchTerms.map(term => ({
          $or: [
            { name: new RegExp(term, 'i') },
            { position: new RegExp(term, 'i') },
            { bio: new RegExp(term, 'i') }
          ]
        }))
      })
        .select('name position bio displayOrder')
        .sort({ displayOrder: 1 })
        .limit(50);
    }

    boardMembers.forEach(item => {
      searchResults.push({
        type: 'board-member',
        id: item._id,
        title: item.name,
        snippet: item.bio?.substring(0, 150) || item.position,
        position: item.position,
        groupLabel: getGroupLabel(item.position),
        url: `/yonetim-kurulu#${item._id}`,
        score: 1
      });
    });

    // ✅ SCORE'A GÖRE SIRALA (En alakalı önce)
    searchResults.sort((a, b) => (b.score || 0) - (a.score || 0));

    console.log(`✅ Toplam ${searchResults.length} sonuç bulundu`);
    console.log(`   📰 ${searchResults.filter(r => r.type === 'news').length} haber`);
    console.log(`   📅 ${searchResults.filter(r => r.type === 'program').length} program`);
    console.log(`   📚 ${searchResults.filter(r => r.type === 'resource').length} kaynak`);
    console.log(`   👥 ${searchResults.filter(r => r.type === 'board-member').length} yönetim kurulu`);

  } catch (error) {
    console.error('❌ Search error:', error);
  }

  return searchResults;
};

// ✅ OLLAMA İLE AI CEVAP OLUŞTUR
const generateAIReply = async (query, searchResults) => {
  try {
    console.log('🤖 Ollama\'ya istek gönderiliyor...');

    // Site içeriğini context olarak hazırla
    let context = '';

    if (searchResults.length > 0) {
      context = 'Site içeriğinde şu bilgiler bulundu:\n\n';
      searchResults.slice(0, 5).forEach((result, idx) => {
        context += `${idx + 1}. [${result.type}] ${result.title}\n`;
        if (result.snippet) {
          context += `   ${result.snippet}\n`;
        }
        context += `   Link: ${result.url}\n\n`;
      });
    } else {
      context = 'Site içeriğinde ilgili sonuç bulunamadı.\n\n';
    }

    // Ollama prompt oluştur
    const userPrompt = `${context}

Soru: "${query}"

2 cümle ile cevap ver. Sonunda "Aşağıdaki linklerden daha fazla bilgi alabilirsiniz" ekle.`;

    // Ollama API çağrısı - /api/chat endpoint kullanılıyor
    const response = await axios.post(OLLAMA_API_URL, {
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'Sen YÖMEGA asistanısın. SADECE TÜRKÇE KONUŞ. Hiçbir zaman İngilizce kullanma. Kısa ve net cevaplar ver. Türkçe karakterleri doğru kullan.'
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      stream: false,
      options: {
        temperature: 0.3,
        top_p: 0.7,
        num_predict: 150
      }
    }, {
      timeout: 30000
    });

    // Response formatını kontrol et (/api/chat veya /api/generate)
    let aiReply = '';
    if (response.data.message && response.data.message.content) {
      // /api/chat formatı
      aiReply = response.data.message.content.trim();
    } else if (response.data.response) {
      // /api/generate formatı (fallback)
      aiReply = response.data.response.trim();
    }

    if (!aiReply) {
      console.log('⚠️  Ollama boş cevap döndü');
      return null;
    }

    console.log('✅ Ollama cevabı alındı:', aiReply.substring(0, 50) + '...');

    return aiReply;

  } catch (error) {
    console.error('❌ Ollama hatası:', error.message);
    
    // Detaylı hata loglama
    if (error.response) {
      console.error('❌ Ollama response hatası:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Ollama request hatası:', error.request);
    }

    // Ollama çalışmıyorsa fallback
    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
      console.log('⚠️  Ollama çalışmıyor. Ollama uygulamasının çalıştığından emin olun.');
      return null;
    }

    // Timeout hatası
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.log('⚠️  Ollama timeout. İstek çok uzun sürdü.');
      return null;
    }

    return null;
  }
};

// Fallback cevap (Ollama çalışmazsa)
const generateFallbackReply = (query, searchResults) => {
  if (!searchResults || searchResults.length === 0) {
    return `"${query}" ile ilgili içerik bulamadım. Lütfen farklı terimler deneyin veya haberler, programlar, kaynaklar veya yönetim kurulu hakkında soru sorabilirsiniz.`;
  }

  const typeCounts = {
    news: searchResults.filter(r => r.type === 'news').length,
    program: searchResults.filter(r => r.type === 'program').length,
    resource: searchResults.filter(r => r.type === 'resource').length,
    'board-member': searchResults.filter(r => r.type === 'board-member').length
  };

  let reply = `"${query}" ile ilgili ${searchResults.length} sonuç buldum:\n\n`;

  if (typeCounts.news > 0) reply += `📰 ${typeCounts.news} haber\n`;
  if (typeCounts.program > 0) reply += `📅 ${typeCounts.program} program\n`;
  if (typeCounts.resource > 0) reply += `📚 ${typeCounts.resource} kaynak\n`;
  if (typeCounts['board-member'] > 0) reply += `👥 ${typeCounts['board-member']} yönetim kurulu üyesi\n`;

  reply += `\nİlgili sonuçları aşağıda görebilirsiniz.`;

  return reply;
};

// Main chat handler
// Main chat handler
const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mesaj gereklidir'
      });
    }

    const query = message.trim();
    console.log('💬 Soru:', query);

    // ✅ YENİ: Intent Detection
    const lowerQuery = query.toLowerCase();

    // Kaynak isteği mi?
    const isResourceRequest =
      lowerQuery.includes('kaynak') &&
      (lowerQuery.includes('öner') ||
        lowerQuery.includes('var mı') ||
        lowerQuery.includes('önerisi') ||
        lowerQuery.includes('tavsiye') ||
        lowerQuery.includes('istiyorum'));

    // Haber isteği mi?
    const isNewsRequest =
      lowerQuery.includes('haber') ||
      lowerQuery.includes('duyuru');
    
    // "En son haber" gibi özel sorgular
    const isLatestNewsRequest =
      lowerQuery.includes('en son haber') ||
      lowerQuery.includes('son haber') ||
      lowerQuery.includes('yeni haber') ||
      lowerQuery.includes('güncel haber');

    // Program isteği mi?
    const isProgramRequest =
      lowerQuery.includes('program') ||
      lowerQuery.includes('etkinlik') ||
      lowerQuery.includes('seminer') ||
      lowerQuery.includes('workshop');

    // Yönetim kurulu isteği mi?
    const isBoardRequest =
      lowerQuery.includes('yönetim') ||
      lowerQuery.includes('kurul') ||
      lowerQuery.includes('başkan');

    console.log(`🎯 İstek türü: ${isResourceRequest ? 'Kaynak' :
      isLatestNewsRequest ? 'En Son Haber' :
      isNewsRequest ? 'Haber' :
        isProgramRequest ? 'Program' :
          isBoardRequest ? 'Yönetim Kurulu' :
            'Genel'
      }`);

    // Site içeriğinde ara
    const searchResults = await searchSiteContent(query, user);
    console.log(`🔍 ${searchResults.length} sonuç bulundu`);

    // ✅ YENİ: Intent'e göre filtrele
    // ✅ Intent'e göre filtrele VE RELEVANCE KONTROLÜ
    let filteredResults = searchResults;
    let intentMessage = '';

    if (isResourceRequest) {
      // ✅ 1. Sadece resource tipini al
      const allResources = searchResults.filter(r => r.type === 'resource');

      console.log(`📚 Toplam ${allResources.length} kaynak bulundu (score filtresi öncesi)`);
      
      // ✅ 2. Arama terimlerini kontrol et - MANUEL RELEVANCE CHECK
      const lowerQuery = query.toLowerCase();
      const queryTerms = lowerQuery.split(/\s+/).filter(term => 
        term.length > 2 && 
        !['hakkında', 'için', 'ile', 'konusunda', 'önerir', 'misin', 'kaynak'].includes(term)
      );
      
      console.log(`🔍 Aranacak terimler:`, queryTerms);
      
      // ✅ 3. Manuel skor hesapla - HER TERİM EŞLEŞMELI
      const relevantResources = allResources.filter(resource => {
        const resourceText = `${resource.title} ${resource.snippet}`.toLowerCase();
        
        // Her arama terimi resource'da var mı?
        const matchCount = queryTerms.filter(term => resourceText.includes(term)).length;
        const matchRate = queryTerms.length > 0 ? matchCount / queryTerms.length : 0;
        
        console.log(`  📖 "${resource.title}" → ${matchCount}/${queryTerms.length} terim eşleşti (${(matchRate * 100).toFixed(0)}%)`);
        
        // En az %80 eşleşme olmalı
        return matchRate >= 0.8;
      });
      
      console.log(`✅ %80+ eşleşen: ${relevantResources.length} kaynak`);
      
      filteredResults = relevantResources;

      console.log(`📚 Toplam ${filteredResults.length} kaynak bulundu`);
      console.log(`📚 Alakalı ${relevantResources.length} kaynak (score >= 2)`);

      // ✅ YENİ: Eğer hiç alakalı kaynak yoksa BOŞ array döndür
      if (relevantResources.length === 0) {
        console.log('⚠️  İlgili kaynak bulunamadı, genel kaynak listesi de gösterilmeyecek');
        filteredResults = []; // Tamamen boş
      } else {
        console.log(`✅ ${relevantResources.length} alakalı kaynak bulundu`);
        filteredResults = relevantResources;
      }

      intentMessage = relevantResources.length > 0
        ? 'Kaynak önerileriniz hazır.'
        : 'Bu konuda kaynak bulunamadı.';

    } else if (isLatestNewsRequest) {
      // En son haber için doğrudan veritabanından en yeni haberi al
      const News = require('../models/News');
      try {
        const latestNews = await News.findOne({ isActive: true })
          .select('title summary content category publishDate slug')
          .sort({ publishDate: -1 })
          .limit(1);
        
        if (latestNews) {
          filteredResults = [{
            type: 'news',
            id: latestNews._id,
            title: latestNews.title,
            snippet: latestNews.summary || latestNews.content?.substring(0, 150) || '',
            url: `/haberler/${latestNews.slug || latestNews._id}`,
            score: 1
          }];
        } else {
          filteredResults = [];
        }
        intentMessage = 'En son haber bulundu.';
        console.log(`📰 En son haber: ${filteredResults.length > 0 ? filteredResults[0].title : 'Bulunamadı'}`);
      } catch (error) {
        console.error('❌ En son haber getirilirken hata:', error);
        filteredResults = [];
      }
    } else if (isNewsRequest) {
      filteredResults = searchResults.filter(r => r.type === 'news');
      intentMessage = 'İlgili haberler bulundu.';
      console.log(`📰 ${filteredResults.length} haber bulundu`);
    } else if (isProgramRequest) {
      filteredResults = searchResults.filter(r => r.type === 'program');
      intentMessage = 'İlgili programlar bulundu.';
      console.log(`📅 ${filteredResults.length} program bulundu`);
    } else if (isBoardRequest) {
      filteredResults = searchResults.filter(r => r.type === 'board-member');
      intentMessage = 'Yönetim kurulu bilgileri bulundu.';
      console.log(`👥 ${filteredResults.length} yönetim kurulu üyesi bulundu`);
    }

    // ✅ Intent'e özel prompt
    // ✅ Intent'e özel prompt (GELIŞTIRILMIŞ)
    const aiQuery = isResourceRequest
      ? filteredResults.length > 0
        ? `Kullanıcı "${query}" diye kaynak istiyor. ${filteredResults.length} alakalı kaynak bulundu. Kısa ve samimi bir şekilde "Tabii ki! ${query} konusunda ${filteredResults.length} kaynak buldum. Aşağıdaki kaynaklara göz atabilirsiniz." gibi bir cevap ver.`
        : `Kullanıcı "${query}" diye kaynak istiyor ama bu konuda kaynak yok. Kısa ve samimi şekilde "Maalesef ${query} konusunda henüz bir kaynağımız bulunmuyor. Ancak diğer konulardaki kaynaklarımıza göz atabilirsiniz. Kaynaklar sayfasına buradan ulaşabilirsiniz: /kaynaklar" de.`
      : isLatestNewsRequest
        ? filteredResults.length > 0
          ? `Kullanıcı "en son haber" diye soruyor. En son haber: "${filteredResults[0].title}". ${filteredResults[0].snippet ? `Özet: ${filteredResults[0].snippet}` : ''} Akıcı ve düzgün Türkçe ile şöyle cevap ver: "En son haberimiz: ${filteredResults[0].title}. ${filteredResults[0].snippet || 'Detaylar için haber sayfasını ziyaret edebilirsiniz.'}" Şeklinde tek bir akıcı cümle kur, devrik olmasın.`
          : `Kullanıcı "en son haber" diye soruyor ama haber bulunamadı. "Şu anda yayınlanmış bir haber bulunmuyor." şeklinde cevap ver.`
      : isNewsRequest
          ? `Kullanıcı "${query}" diye haber soruyor. ${filteredResults.length} haber bulundu. Akıcı Türkçe ile kısa bilgi ver ve aşağıdaki haberlere bakmasını söyle. Devrik cümleler kullanma.`
        : isProgramRequest
          ? `Kullanıcı "${query}" diye program/etkinlik soruyor. ${filteredResults.length} program bulundu. Kısa bilgi ver ve aşağıdaki programlara bakmasını söyle.`
          : isBoardRequest
            ? `Kullanıcı "${query}" diye yönetim kurulu soruyor. ${filteredResults.length} üye bulundu. Kısa bilgi ver ve aşağıdaki kişilere bakmasını söyle.`
            : query;

    // ✅ ÖNCE OLLAMA İLE DENE
    let reply = await generateAIReply(aiQuery, filteredResults);

    // ✅ OLLAMA ÇALIŞMAZSA FALLBACK KULLAN
    if (!reply) {
      console.log('⚠️  Ollama kullanılamıyor, fallback kullanılıyor');

      // Intent'e göre fallback cevap
      // Intent'e göre fallback cevap (GELIŞTIRILMIŞ)
      if (isResourceRequest) {
        if (filteredResults.length > 0) {
          reply = `Tabii ki! "${query}" konusunda ${filteredResults.length} kaynak buldum. İsterseniz aşağıdaki linklerden merak ettiğiniz kısım hakkında daha fazla bilgi alabilirsiniz.`;
        } else {
          // ✅ YENİ: Kaynak yoksa özel mesaj
          reply = `Maalesef "${query}" konusunda henüz bir kaynağımız bulunmuyor. Ancak diğer konulardaki kaynaklarımıza göz atabilirsiniz. Kaynaklar sayfasına buradan ulaşabilirsiniz: /kaynaklar`;
        }
      } else if (isLatestNewsRequest) {
        if (filteredResults.length > 0) {
          const snippet = filteredResults[0].snippet || 'Detaylar için haber sayfasını ziyaret edebilirsiniz.';
          reply = `En son haberimiz: ${filteredResults[0].title}. ${snippet}`;
        } else {
          reply = `Şu anda yayınlanmış bir haber bulunmuyor.`;
        }
      } else if (isNewsRequest && filteredResults.length > 0) {
        reply = `"${query}" ile ilgili ${filteredResults.length} haber bulundu. Aşağıdaki haberlere göz atabilirsiniz.`;
      } else if (isProgramRequest && filteredResults.length > 0) {
        reply = `"${query}" ile ilgili ${filteredResults.length} program/etkinlik bulundu. Detaylar aşağıda.`;
      } else if (isBoardRequest && filteredResults.length > 0) {
        reply = `Yönetim kurulu hakkında ${filteredResults.length} sonuç bulundu. Aşağıdaki kişilere bakabilirsiniz.`;
      } else {
        reply = generateFallbackReply(query, filteredResults);
      }
    }

    // ✅ Format suggestions (filtrelenmiş sonuçları kullan)
    let suggestions = filteredResults.slice(0, 10).map(result => ({
      title: result.title,
      snippet: result.snippet || '',
      type: result.type,
      groupLabel: result.groupLabel || null,
      url: result.url
    }));

    // ✅ YENİ: Eğer kaynak isteği ve sonuç yoksa, örnek kaynaklar göster
    // ✅ YENİ: Eğer kaynak isteği ve sonuç yoksa, HİÇBİR ŞEY GÖSTERME
    if (isResourceRequest && filteredResults.length === 0) {
      console.log('⚠️  Bu konuda kaynak yok, hiçbir şey gösterilmeyecek');
      suggestions = []; // BOŞ - Hiçbir şey gösterme
    }

    res.json({
      success: true,
      reply: reply,
      suggestions: suggestions
    });

  } catch (error) {
    console.error('❌ Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Chat sırasında hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  handleChat
};