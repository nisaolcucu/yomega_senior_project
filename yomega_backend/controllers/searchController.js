const News = require('../models/News');
const Program = require('../models/Program');
const Resource = require('../models/Resource');
const BoardMember = require('../models/BoardMember');

// Turkish character normalization
const normalizeTurkish = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
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

// Simple synonym/query expansion map
const synonymMap = {
  'haberler': ['haber', 'duyuru', 'news', 'announcement'],
  'haber': ['haberler', 'duyuru', 'news'],
  'yönetim': ['kurul', 'board', 'yonetim', 'yönetim kurulu'],
  'kurul': ['yönetim', 'board', 'yonetim kurulu'],
  'aidat': ['dues', 'odeme', 'payment', 'ücret'],
  'üyelik': ['uye', 'membership', 'kayit', 'registration'],
  'program': ['etkinlik', 'event', 'seminer', 'workshop', 'programlar'],
  'programlar': ['program', 'etkinlik', 'event', 'seminer', 'workshop'],
  'etkinlik': ['program', 'programlar', 'event', 'seminer', 'workshop'],
  'kaynak': ['resource', 'materyal', 'dosya', 'file'],
  'kaynaklar': ['kaynak', 'resource', 'materyal', 'dosya', 'file'],
  'denetim': ['denetim kurulu', 'audit', 'kontrol'],
  'başkan': ['president', 'chairman', 'yonetici']
};

// Expand query with synonyms
const expandQuery = (query) => {
  const normalized = normalizeTurkish(query);
  const terms = normalized.split(/\s+/);
  const expanded = new Set([normalized]); // Always include original
  
  terms.forEach(term => {
    if (synonymMap[term]) {
      synonymMap[term].forEach(syn => expanded.add(syn));
    }
  });
  
  // Also check full query
  Object.keys(synonymMap).forEach(key => {
    if (normalized.includes(key)) {
      synonymMap[key].forEach(syn => expanded.add(syn));
    }
  });
  
  return Array.from(expanded).join(' ');
};

// Calculate relevance score for a result
const calculateRelevanceScore = (result, query) => {
  const queryLower = query.toLowerCase();
  const titleLower = (result.title || '').toLowerCase();
  const snippetLower = (result.snippet || result.description || '').toLowerCase();
  
  let score = 0;
  
  // Exact title match (highest priority)
  if (titleLower === queryLower) {
    score += 100;
  } else if (titleLower.includes(queryLower)) {
    score += 50;
  }
  
  // Position/group/category match
  if (result.position && result.position.toLowerCase().includes(queryLower)) {
    score += 30;
  }
  if (result.groupLabel && result.groupLabel.toLowerCase().includes(queryLower)) {
    score += 30;
  }
  if (result.category && result.category.toLowerCase().includes(queryLower)) {
    score += 30;
  }
  
  // Description/snippet match
  if (snippetLower.includes(queryLower)) {
    score += 10;
  }
  
  // Type match bonus
  if (result.type === 'board-member' && (queryLower.includes('yönetim') || queryLower.includes('kurul'))) {
    score += 20;
  }
  
  return score;
};

// AI assistance helper (optional - graceful fallback if no API key)
const enhanceWithAI = async (query, results) => {
  // If OpenAI API key is not configured, skip AI enhancement
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    // Try to require OpenAI - graceful fallback if package not installed
    let OpenAI;
    try {
      OpenAI = require('openai');
    } catch (requireError) {
      console.log('OpenAI package not installed, skipping AI enhancement');
      return null;
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Create a summary of search results for AI context
    const resultsSummary = results.map(r => ({
      type: r.type,
      title: r.title,
      snippet: r.snippet || r.description || r.content?.substring(0, 200) || ''
    }));

    const prompt = `Kullanıcı "${query}" terimini aradı. Aşağıdaki sonuçlar bulundu. 
    Kullanıcıya daha iyi yardımcı olmak için:
    1. Arama terimini analiz et ve daha iyi arama önerileri sun
    2. Sonuçları kategorize et ve özetle
    3. Eksik sonuçlar varsa alternatif arama terimleri öner
    
    Sonuçlar: ${JSON.stringify(resultsSummary, null, 2)}
    
    Türkçe olarak, kısa ve öz bir şekilde yanıt ver.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Sen bir arama asistanısın. Kullanıcılara arama sonuçlarını analiz edip öneriler sunuyorsun.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI Enhancement Error:', error);
    // Graceful fallback - return null if AI fails
    return null;
  }
};


// Global search across all content types
const globalSearch = async (req, res) => {
  try {
    const { q, page = 1, limit = 10, types } = req.query;
    const user = req.user; // From optionalAuth middleware

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Arama terimi gereklidir'
      });
    }

    // Normalize and expand query
    const originalQuery = q.trim();
    if (!originalQuery || originalQuery.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Arama terimi gereklidir'
      });
    }
    
    const normalizedQuery = normalizeTurkish(originalQuery);
    const expandedQuery = expandQuery(originalQuery);
    
    // Use expanded query for better search results
    const searchTerm = expandedQuery; // Use expanded for MongoDB text search
    const searchTypes = types ? types.split(',') : ['news', 'programs', 'resources', 'board-members'];
    const results = [];
    
    // Debug: log search configuration
    console.log(`[SEARCH CONFIG] Types: ${searchTypes.join(', ')}, Limit: ${limit}, Page: ${page}`);

    // Escape special regex characters for fallback regex search
    // Also split into terms for better matching
    const searchTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 1); // Changed from > 2 to > 1
    const escapedTerms = searchTerms.length > 0 
      ? searchTerms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      : [normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')];
    const regexPatterns = escapedTerms.map(term => new RegExp(term, 'i'));
    
    console.log(`[SEARCH] Original: "${originalQuery}", Normalized: "${normalizedQuery}", Expanded: "${expandedQuery}"`);
    console.log(`[SEARCH] Search terms:`, searchTerms);
    console.log(`[SEARCH] Regex patterns:`, regexPatterns.map(p => p.source));

    // Search News
    if (searchTypes.includes('news')) {
      try {
        // Önce toplam haber sayısını kontrol et
        const totalNews = await News.countDocuments({ isActive: true });
        console.log(`📰 Toplam aktif haber sayısı: ${totalNews}`);
        
        let news = [];
        
        // Try text search first
        try {
          news = await News.find({
            isActive: true,
            $text: { $search: searchTerm }
          })
          .populate('author', 'name')
          .select('title summary content image category publishDate slug')
          .sort({ score: { $meta: 'textScore' }, publishDate: -1 })
          .limit(parseInt(limit));
          
          console.log(`📰 News text search: ${news.length} results for "${searchTerm}"`);
        } catch (textError) {
          console.log('⚠️  News text index yok veya hata:', textError.message);
          console.log('⚠️  Text search hatası detayı:', textError);
          news = [];
        }
        
        // If text search returned no results, try regex fallback
        if (!news || news.length === 0) {
          console.log(`📰 Text search sonuç vermedi, regex fallback deneniyor...`);
          
          // Create OR conditions for each pattern
          const regexConditions = [];
          regexPatterns.forEach(pattern => {
            regexConditions.push(
              { title: pattern },
              { content: pattern },
              { summary: pattern },
              { category: pattern }
            );
          });
          
          console.log(`📰 Regex conditions: ${regexConditions.length} conditions`);
          
          news = await News.find({
            isActive: true,
            $or: regexConditions
          })
          .populate('author', 'name')
          .select('title summary content image category publishDate slug')
          .sort({ publishDate: -1 })
          .limit(parseInt(limit));
          
          console.log(`📰 News regex search: ${news.length} results`);
          
          // Eğer hala sonuç yoksa, tüm haberleri getir (test için)
          if (news.length === 0 && totalNews > 0) {
            console.log(`⚠️  Hiç sonuç bulunamadı, test için son 5 haberi getiriyorum...`);
            news = await News.find({ isActive: true })
              .populate('author', 'name')
              .select('title summary content image category publishDate slug')
              .sort({ publishDate: -1 })
              .limit(5);
            console.log(`📰 Test: ${news.length} haber getirildi`);
          }
        }

        news.forEach(item => {
          results.push({
            type: 'news',
            id: item._id,
            title: item.title,
            description: item.summary || item.content?.substring(0, 200) + '...',
            image: item.image,
            category: item.category,
            date: item.publishDate,
            url: `/haberler/${item.slug || item._id}`,
            snippet: item.summary || item.content?.substring(0, 150)
          });
        });
      } catch (error) {
        console.error('News search error:', error);
      }
    }

    // Search Programs
    if (searchTypes.includes('programs')) {
      try {
        // Önce toplam program sayısını kontrol et
        const totalPrograms = await Program.countDocuments({ status: 'yayınlandı' });
        console.log(`📅 Toplam yayınlanmış program sayısı: ${totalPrograms}`);
        
        let programs = [];
        
        // Try text search first
        try {
          programs = await Program.find({
            status: 'yayınlandı',
            $text: { $search: searchTerm }
          })
          .populate('organizer', 'name')
          .select('title description shortDescription speaker dateTime category location')
          .sort({ score: { $meta: 'textScore' }, dateTime: 1 })
          .limit(parseInt(limit));
          
          console.log(`📅 Program text search: ${programs.length} results for "${searchTerm}"`);
        } catch (textError) {
          console.log('⚠️  Program text index yok veya hata:', textError.message);
          console.log('⚠️  Text search hatası detayı:', textError);
          programs = [];
        }
        
        // If text search returned no results, try regex fallback
        if (!programs || programs.length === 0) {
          console.log(`📅 Text search sonuç vermedi, regex fallback deneniyor...`);
          
          // Create OR conditions for each pattern
          const regexConditions = [];
          regexPatterns.forEach(pattern => {
            regexConditions.push(
              { title: pattern },
              { description: pattern },
              { shortDescription: pattern },
              { 'speaker.name': pattern },
              { category: pattern }
            );
          });
          
          console.log(`📅 Regex conditions: ${regexConditions.length} conditions`);
          
          programs = await Program.find({
            status: 'yayınlandı',
            $or: regexConditions
          })
          .populate('organizer', 'name')
          .select('title description shortDescription speaker dateTime category location')
          .sort({ dateTime: 1 })
          .limit(parseInt(limit));
          
          console.log(`📅 Program regex search: ${programs.length} results`);
          
          // Eğer hala sonuç yoksa, tüm programları getir (test için)
          if (programs.length === 0 && totalPrograms > 0) {
            console.log(`⚠️  Hiç sonuç bulunamadı, test için son 5 programı getiriyorum...`);
            programs = await Program.find({ status: 'yayınlandı' })
              .populate('organizer', 'name')
              .select('title description shortDescription speaker dateTime category location')
              .sort({ dateTime: 1 })
              .limit(5);
            console.log(`📅 Test: ${programs.length} program getirildi`);
          }
        }

        programs.forEach(item => {
          results.push({
            type: 'program',
            id: item._id,
            title: item.title,
            description: item.shortDescription || item.description?.substring(0, 200) + '...',
            speaker: item.speaker?.name,
            date: item.dateTime,
            category: item.category,
            url: `/program-konusmacilar/${item._id}`,
            snippet: item.shortDescription || item.description?.substring(0, 150)
          });
        });
      } catch (error) {
        console.error('Program search error:', error);
      }
    }

    // Search Resources
    if (searchTypes.includes('resources')) {
      try {
        // Access control base
        const accessFilter = !user 
          ? { access: 'public' }
          : (!user.isAdmin && user.role !== 'admin')
            ? { access: { $in: ['public', 'members'] } }
            : {};

        let resources = [];
        
        // Try text search first
        try {
          resources = await Resource.find({
            isActive: true,
            ...accessFilter,
            $text: { $search: searchTerm }
          })
          .populate('uploadedBy', 'name')
          .select('title description category type tags publishDate')
          .sort({ score: { $meta: 'textScore' }, publishDate: -1 })
          .limit(parseInt(limit));
          
          console.log(`📚 Resource text search: ${resources.length} results`);
        } catch (textError) {
          console.log('⚠️  Resource text index yok veya hata:', textError.message);
          resources = [];
        }
        
        // If text search returned no results, try regex fallback
        if (!resources || resources.length === 0) {
          // Create OR conditions for each pattern
          const regexConditions = [];
          regexPatterns.forEach(pattern => {
            regexConditions.push(
              { title: pattern },
              { description: pattern },
              { category: pattern },
              { tags: pattern } // MongoDB matches any array element
            );
          });
          
          resources = await Resource.find({
            isActive: true,
            ...accessFilter,
            $or: regexConditions
          })
          .populate('uploadedBy', 'name')
          .select('title description category type tags publishDate')
          .sort({ publishDate: -1 })
          .limit(parseInt(limit));
          
          console.log(`📚 Resource regex search: ${resources.length} results`);
        }

        resources.forEach(item => {
          results.push({
            type: 'resource',
            id: item._id,
            title: item.title,
            description: item.description?.substring(0, 200) + '...',
            category: item.category,
            type: item.type,
            date: item.publishDate,
            url: `/kaynaklar/${item._id}`,
            snippet: item.description?.substring(0, 150)
          });
        });
      } catch (error) {
        console.error('Resource search error:', error);
      }
    }

    // Helper function to get group label from position
    const getGroupLabel = (position) => {
      const positionLower = position?.toLowerCase() || '';
      
      // Yönetim Kurulu Asil
      if (['başkan', 'başkan yardımcısı', 'genel sekreter', 'sayman', 'üye'].includes(positionLower)) {
        return 'Yönetim Kurulu Asil';
      }
      // Yönetim Kurulu Yedek
      if (positionLower === 'yedek üye') {
        return 'Yönetim Kurulu Yedek';
      }
      // Denetim Kurulu Asil
      if (['denetim kurulu başkanı', 'denetim kurulu üyesi'].includes(positionLower)) {
        return 'Denetim Kurulu Asil';
      }
      // Denetim Kurulu Yedek
      if (positionLower === 'denetim kurulu yedek üyesi') {
        return 'Denetim Kurulu Yedek';
      }
      // Kurucu
      if (positionLower === 'kurucu üye') {
        return 'Kurucu Üye';
      }
      
      return 'Yönetim Kurulu';
    };

    // Search Board Members
    if (searchTypes.includes('board-members')) {
      try {
        // Board members - try text search first, fallback to regex
        const boardMemberLimit = 200;
        let boardMembers = [];
        
        // Try text search first (if index exists)
        try {
          boardMembers = await BoardMember.find({
            isActive: true,
            isPublic: true,
            $text: { $search: searchTerm } // Use expanded query for better matching
          })
          .select('name position bio image expertise displayOrder')
          .sort({ score: { $meta: 'textScore' }, displayOrder: 1 })
          .limit(boardMemberLimit);
          
          console.log(`👥 BoardMember text search: ${boardMembers.length} results`);
        } catch (textError) {
          console.log('⚠️  BoardMember text index yok veya hata:', textError.message);
          boardMembers = [];
        }
        
        // If text search returned no results, try regex fallback
        if (!boardMembers || boardMembers.length === 0) {
          // Create OR conditions for each pattern
          const regexConditions = [];
          regexPatterns.forEach(pattern => {
            regexConditions.push(
              { name: pattern },
              { position: pattern },
              { bio: pattern },
              { expertise: pattern }
            );
          });
          
          boardMembers = await BoardMember.find({
            isActive: true,
            isPublic: true,
            $or: regexConditions
          })
          .select('name position bio image expertise displayOrder')
          .sort({ displayOrder: 1 })
          .limit(boardMemberLimit);
          
          console.log(`👥 BoardMember regex search: ${boardMembers.length} results`);
        }

        boardMembers.forEach(item => {
          results.push({
            type: 'board-member',
            id: item._id,
            title: item.name,
            description: `${item.position}${item.bio ? ' - ' + item.bio.substring(0, 150) + '...' : ''}`,
            position: item.position,
            groupLabel: getGroupLabel(item.position),
            image: item.image,
            displayOrder: item.displayOrder,
            url: `/yonetim-kurulu#${item._id}`,
            snippet: item.bio?.substring(0, 150) || item.position
          });
        });
      } catch (error) {
        console.error('Board member search error:', error);
      }
    }

    // Calculate relevance scores and sort
    results.forEach(result => {
      result._relevanceScore = calculateRelevanceScore(result, originalQuery);
    });
    
    // Sort by relevance score (highest first)
    results.sort((a, b) => {
      if (b._relevanceScore !== a._relevanceScore) {
        return b._relevanceScore - a._relevanceScore;
      }
      // Secondary sort: board members by displayOrder, others by date
      if (a.type === 'board-member' && b.type === 'board-member') {
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      }
      if (a.date && b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      return 0;
    });
    
    // Remove internal score field before sending
    results.forEach(result => {
      delete result._relevanceScore;
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = results.slice(startIndex, endIndex);

    // AI Enhancement (optional, non-blocking)
    let aiSuggestion = null;
    if (paginatedResults.length > 0) {
      try {
        aiSuggestion = await enhanceWithAI(searchTerm, paginatedResults);
      } catch (error) {
        console.error('AI enhancement failed:', error);
        // Continue without AI suggestion
      }
    }

    // Debug: log search results (remove after testing)
    console.log(`[SEARCH] Query: "${originalQuery}" -> "${searchTerm}", Found: ${results.length} results, Returning: ${paginatedResults.length} results`);
    console.log(`[SEARCH] Result types:`, {
      news: results.filter(r => r.type === 'news').length,
      programs: results.filter(r => r.type === 'program').length,
      resources: results.filter(r => r.type === 'resource').length,
      boardMembers: results.filter(r => r.type === 'board-member').length
    });
    
    if (paginatedResults.length > 0) {
      console.log(`[SEARCH] First result:`, {
        type: paginatedResults[0].type,
        title: paginatedResults[0].title,
        url: paginatedResults[0].url
      });
    }

    res.json({
      success: true,
      data: {
        results: paginatedResults || [],
        searchTerm: originalQuery, // Return original query, not normalized
        total: results.length,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(results.length / parseInt(limit)),
          total: results.length
        },
        aiSuggestion: aiSuggestion,
        searchedTypes: searchTypes
      }
    });

  } catch (error) {
    console.error('Global Search Error:', error);
    res.status(500).json({
      success: false,
      message: 'Arama sırasında hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Quick search suggestions (for autocomplete)
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const searchTerm = q.trim();
    const suggestions = [];

    // Quick title matches from each collection
    try {
      const newsTitles = await News.find({
        isActive: true,
        title: { $regex: searchTerm, $options: 'i' }
      })
      .select('title slug')
      .limit(3);

      newsTitles.forEach(item => {
        suggestions.push({
          type: 'news',
          text: item.title,
          url: `/haberler/${item.slug || item._id}`
        });
      });
    } catch (error) {
      console.error('News suggestions error:', error);
    }

    try {
      const programTitles = await Program.find({
        status: 'yayınlandı',
        title: { $regex: searchTerm, $options: 'i' }
      })
      .select('title')
      .limit(3);

      programTitles.forEach(item => {
        suggestions.push({
          type: 'program',
          text: item.title,
          url: `/program-konusmacilar/${item._id}`
        });
      });
    } catch (error) {
      console.error('Program suggestions error:', error);
    }

    res.json({
      success: true,
      data: { suggestions: suggestions.slice(0, 5) }
    });

  } catch (error) {
    console.error('Search Suggestions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Öneriler getirilirken hata oluştu'
    });
  }
};

module.exports = {
  globalSearch,
  getSearchSuggestions
};