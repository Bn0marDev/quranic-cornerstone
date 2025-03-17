
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, BookOpen, ExternalLink, Copy, Volume2 } from 'lucide-react';
import { useQuran } from '@/hooks/useQuran';
import AudioPlayer from './AudioPlayer';

interface QuranReaderProps {
  surah: any;
}

const QuranReader = ({ surah }: QuranReaderProps) => {
  const { getAyahs, loading, error } = useQuran();
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [displayMode, setDisplayMode] = useState<'text' | 'image'>('text');
  const [showTranslation, setShowTranslation] = useState(true);
  const [selectedAudio, setSelectedAudio] = useState<{ surah: number; ayah: number; url: string } | null>(null);

  useEffect(() => {
    if (surah) {
      const loadAyahs = async () => {
        const ayahData = await getAyahs(surah.number);
        setAyahs(ayahData);
        
        // Save last read position in localStorage
        localStorage.setItem('lastReadSurah', JSON.stringify(surah));
      };
      
      loadAyahs();
    }
  }, [surah, getAyahs]);

  const handleCopyAyah = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification here
  };

  const playAudio = (ayah: any) => {
    if (ayah.audio) {
      setSelectedAudio({
        surah: surah.number,
        ayah: ayah.numberInSurah,
        url: ayah.audio
      });
    }
  };

  if (!surah) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center p-6">
          <div className="text-center max-w-md mx-auto">
            <BookOpen className="h-12 w-12 mx-auto opacity-20 mb-4" />
            <h3 className="text-xl font-medium mb-2">اختر سورة</h3>
            <p className="text-muted-foreground">
              اختر سورة من القائمة للبدء في قراءة القرآن الكريم.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="h-full animate-pulse">
        <CardHeader>
          <CardTitle>جاري تحميل السورة...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-secondary/30 rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>خطأ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            خطأ في تحميل السورة. يرجى المحاولة مرة أخرى لاحقًا.
            <Button variant="primary" className="mt-4" onClick={() => window.location.reload()}>
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <span>{surah.englishName}</span>
            <span className="arabic mr-2 text-xl">{surah.name}</span>
            <span className="mr-2 text-sm text-muted-foreground">({surah.number})</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {surah.englishNameTranslation} • {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {ayahs.length} آية
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTranslation(!showTranslation)}
          >
            {showTranslation ? 'إخفاء' : 'إظهار'} الترجمة
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDisplayMode(displayMode === 'text' ? 'image' : 'text')}
          >
            {displayMode === 'text' ? 'عرض الصورة' : 'عرض النص'}
          </Button>
          <Button variant="outline" size="icon">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {displayMode === 'text' ? (
          <div className="space-y-6 pb-20">
            {/* Bismillah header for all surahs except Al-Tawbah (9) */}
            {surah.number !== 9 && (
              <div className="text-center my-6">
                <p className="arabic text-2xl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                {showTranslation && (
                  <p className="text-sm text-muted-foreground mt-2">
                    بسم الله الرحمن الرحيم
                  </p>
                )}
              </div>
            )}
            
            {ayahs.map((ayah) => (
              <div key={ayah.number} className="group relative border-b border-border pb-6 transition-colors hover:bg-accent/10 -mx-6 px-6">
                <div className="flex items-start">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary shrink-0 ml-3 mt-1 text-sm">
                    {ayah.numberInSurah}
                  </div>
                  <div>
                    <p dir="rtl" className="arabic text-xl leading-relaxed mb-2">
                      {ayah.text}
                    </p>
                    {showTranslation && (
                      <p className="text-muted-foreground">
                        {ayah.translation}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="absolute right-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleCopyAyah(ayah.text)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => playAudio(ayah)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  
                  {/* External link using <a> tag instead of Button with as prop */}
                  <a
                    href={`https://quran.com/${surah.number}/${ayah.numberInSurah}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent/50"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>عرض الصور سيكون متاحًا في تحديث مستقبلي.</p>
          </div>
        )}
        
        {selectedAudio && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-2 z-30">
            <AudioPlayer 
              audioUrl={selectedAudio.url} 
              title={`${surah.englishName} - آية ${selectedAudio.ayah}`}
              onClose={() => setSelectedAudio(null)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuranReader;
