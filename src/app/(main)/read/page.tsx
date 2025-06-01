
"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Settings, Search as SearchIcon, Maximize, Map, X, Edit3,
  MessageSquare, Eye, EyeOff, AlignLeft, AlignCenter, AlignJustify, CornerUpLeft, List, Lightbulb
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { explainTextSelection } from '@/ai/flows/explain-text-selection';
import type { ExplainTextSelectionInput, ExplainTextSelectionOutput } from '@/ai/flows/explain-text-selection';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { SimulatedKnowledgeGraph } from '@/components/SimulatedKnowledgeGraph';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover";

interface Annotation {
  text: string; 
  note: string; 
  id: string;   
}

interface Paragraph {
  content: Array<string | Annotation>;
  vernacular?: string;
}

interface Chapter {
  id: number;
  title: string;
  subtitle?: string;
  summary: string;
  paragraphs: Paragraph[];
}

const chapters: Chapter[] = [
  {
    id: 1,
    title: "第一回 甄士隱夢幻識通靈 賈雨村風塵懷閨秀",
    subtitle: "紅樓夢:第三版(中國古典文學讀本叢書)",
    summary: "本回主要講述了甄士隱夢遇一僧一道談論石頭下凡歷劫，以及賈雨村的落魄與發跡。甄士隱因女兒英蓮被拐、家遭火災而看破紅塵，隨跛足道人出家，點出了小說「真事隱去，假語存焉」的創作主旨和「夢幻」的基調。",
    paragraphs: [
      { content: ["此開卷第一回也。作者自云：因曾歷過一番夢幻之後，故將真事隱去，而借「通靈」之說，撰此《石頭記》一書也。故曰「甄士隱」云云。但書中所記何事何人？自又云：「今風塵碌碌，一事無成，忽念及當日所有之女子，一一細考較去，覺其行止見識，皆出我之上。我堂堂鬚眉，誠不若彼裙釵。我實愧則有餘，悔又無益，大無可如何之日也！当此日，欲將已往所賴天恩祖德，錦衣紈褲之時，飫甘饜肥之日，背父兄教育之恩，負師友規訓之德，以致今日一技無成，半生潦倒之罪，編述一集，以告天下。知我之負罪固多，然閨閣中歷歷有人，萬不可因我之不肖，自護己短，一併使其泯滅也。故當此時，自欲將以往經歷，及素所聞識，逐細編次，作為小說，聊以表我這些姊妹。雖不敢比類自己，自謂可以傳世，亦可使閨閣昭傳。復可破一時之悶，醒同人之目，不亦宜乎？」故曰「賈雨村」云云。"], vernacular: "（白話文）這是本書的第一回。作者自己說：因為曾經經歷過一番夢幻般的事情，所以把真實的事情隱藏起來，借用「通靈寶玉」的說法，寫成了這本《石頭記》。所以書中稱「甄士隱」等等。但書中記載的是什麼事、什麼人呢？作者又說：「現在我到處奔波，一事無成，忽然想起當年的那些女子，一個個仔細回想比較，覺得她們的言行見識，都在我之上。我一個堂堂男子，實在不如那些女性。我實在是慚愧有餘，後悔也沒用，真是非常無奈啊！在那時，我想把自己過去依仗著上天的恩賜和祖先的功德，過著富裕悠閒生活的時候，享受著美味佳餚的日子，卻違背了父兄的教誨，辜負了老師朋友的規勸，以至於今天一無所長，半生潦倒的罪過，編寫成一本書，告訴世人。我知道我的罪過很多，但是女性當中確實有很多傑出的人物，千萬不能因為我的不成才，只顧著掩飾自己的缺點，而讓她们的事蹟也跟著被埋沒了。所以在這個時候，我自己想把過去的經歷，以及平時聽到見到的事情，詳細地編排起來，寫成小說，來表彰我這些姐妹們。雖然不敢和自己相提並論，自認為可以流傳後世，也可以讓女性們的事蹟顯揚。又可以解除一時的煩悶，提醒世人，不也是件好事嗎？」所以書中稱「賈雨村」等等。" },
      { 
        content: [
          "你道此書從何而起？說來雖近荒唐，細玩頗有趣味。卻說那",
          { 
            text: "女媧氏煉石補天", 
            note: "女媧氏煉石補天——古代神話：天原來不整齊，女媧氏煉五色石把它修補起來。後又被共工氏闖壞，天塌了西北角，地陷了東南角。見《列子》。《列子》注說女媧氏是「古天子」，「風」姓。所以又稱「媧皇」。",
            id: "ch1-p2-anno-nuwa" 
          },
          "之時，於大荒山無稽崖煉成高十二丈、見方二十四丈大的頑石三萬六千五百零一塊。那媧皇只用了三萬六千五百塊，單單剩下一塊未用，棄在此山青埂峰下。誰知此石自經鍛煉之後，靈性已通，自去自來，可大可小。因見眾石俱得補天，獨自己無才不堪入選，遂自怨自愧，日夜悲哀。"
        ], 
        vernacular: "（白話文）你說這本書是從哪裡開始的呢？說起來雖然近乎荒誕，但仔細品味卻很有趣味。話說那女媧娘娘煉石補天的時候，在大荒山無稽崖煉成了高十二丈、寬二十四丈的石頭三萬六千五百零一塊。女媧娘娘只用了三萬六千五百塊，偏偏剩下一塊沒用，丟棄在這座山的青埂峰下。誰知道這塊石頭經過鍛煉之後，已經有了靈性，能夠自己來去，可大可小。因為看見所有的石頭都能補天，只有自己沒有才能不能入選，於是自己埋怨自己慚愧，日夜悲傷。" 
      },
      { content: ["一日，正當嗟悼之際，俄見一僧一道，遠遠而來，生得骨格不凡，豐神迥異，來到這青埂峰下，席地而坐，長談闊論。見到這塊鮮瑩明潔的石頭，左瞧右看，先是嘆息，後又大笑，攜手問道：「你這蠢物，有何好處？倒是把你的形狀，出身，來歷，明白寫在那上面，待我帶你到那花柳繁華地，溫柔富貴鄉去走一遭。」石頭聽了大喜，因答道：「我師何必勞神？弟子願隨二師前去。」那僧道：「你是不中用的。況且，你這本體也過大了些，須得再鐫上幾個字，使人一見便知你是件奇物，然後攜你到那經歷富貴的所在，受用一番。再把你送回來，豈不兩全？」石頭聽了，益發歡喜，忙叩頭拜謝。"], vernacular: "（白話文）有一天，正當它傷心感嘆的時候，忽然看見一個和尚和一個道士，遠遠地走過來，長得骨骼不凡，神采與眾不同，來到這青埂峰下，就地坐下，高談闊論。看到這塊光潔明亮的石頭，左看右看，先是嘆息，後來又大笑起來，拉著手問道：「你這個笨東西，有什麼好處？不如把你的形狀、出身、來歷，清楚地寫在上面，等我帶你到那花紅柳綠的繁華地方，溫柔富貴的去處去走一趟。」石頭聽了非常高興，於是回答說：「師父何必勞神？弟子願意跟隨兩位師父前去。」那和尚道士說：「你是不中用的。況且，你這本來的形體也太大了些，必須再刻上幾個字，讓人一看就知道你是件奇物，然後帶你到那經歷富貴的地方，享受一番。再把你送回來，豈不是兩全其美？」石頭聽了，更加高興，連忙磕頭拜謝。" },
      { content: ["那僧便念咒書符，大展幻術，將一塊大石登時變成一塊鮮明瑩潔的美玉，又縮成扇墜一般大小，托在掌上。笑道：「形體倒也是個寶物了！還只沒有實在的好處。」因回頭問道士：「你道這一番塵世，何處為樂？」道士道：「此事說來話長，一時難以说完。不過，歷來風流儻灑之輩，多情好色之徒，悉皆生成在東南地界。那裡雖好，然斷不可久居。況且，目今正值太平盛世，文章顯赫之時，我輩正可借此機會，到那繁華昌盛之處，訪幾位仙友，也不枉此一行。」那僧道：「妙哉，妙哉！正合吾意。」二人遂相攜飄然而去，不知所蹤。"], vernacular: "（白話文）那和尚便念起咒語，畫起符籙，施展出高超的幻術，把一塊大石頭立刻變成一塊鮮明光潔的美玉，又縮小成扇墜一般大小，托在手掌上。笑著說：「形體倒也是個寶物了！還只是沒有實際的好處。」於是回頭問道士：「你說這人世間，什麼地方最快樂？」道士說：「這件事說來話長，一時難以說完。不過，歷來風流倜傥的人，多情好色的人，大多都出生在東南地區。那裡雖然好，但是決不能長久居住。況且，現在正是太平盛世，文章顯赫的時候，我們正好可以藉此機會，到那繁華昌盛的地方，拜訪幾位仙友，也不枉此行。」那和尚說：「好啊，好啊！正合我的意思。」於是兩個人便互相攙扶著飄然離去，不知道去了哪裡。" },
      { content: ["卻說姑蘇城關外，有個葫蘆廟，廟旁住着一家鄉宦，姓甄名費，字士隱。嫡妻封氏，情性賢淑，深明禮義。家中雖不甚富貴，然本地便也推為望族了。因這甄士隱稟性恬淡，不以功名為念，每日只以觀花種竹、酌酒吟詩為樂，倒是神仙一流人物。只是一件不足：年過半百，膝下無兒，只有一女，乳名英蓮，年方三歲。"], vernacular: "（白話文）再說姑蘇城外，有個葫蘆廟，廟旁邊住著一家鄉紳，姓甄名費，字士隱。他的正妻封氏，性情賢淑，深明禮儀。家裡雖然不算非常富貴，但在當地也被推崇為有聲望的家族。因為這甄士隱生性恬靜淡泊，不把功名利祿放在心上，每天只是以觀賞花草、種植竹子、飲酒賦詩為樂，倒像是神仙一般的人物。只有一件不如意的事：年紀過了五十，膝下沒有兒子，只有一個女兒，乳名叫英蓮，才三歲。" },
      { content: ["這日，甄士隱炎夏永晝，閒坐書齋，手拈素珠，默默無言。忽聞窗外鼓樂之聲，回頭一看，只見一人，方面大耳，形狀魁梧，布衣草履，醉步而來。士隱認得，是本地的一個窮儒，姓賈名化，表字時飛，別號雨村。這賈雨村原系湖州人氏，亦系讀書人，因他生於末世，父母祖宗根基已盡，人口衰喪，只剩下他一身一口，在家鄉無益，因進京求取功名，再整基業。自前歲來此，又淹蹇住了，暫寄姑蘇城關外葫蘆廟內安身，每日賣文作字為生，故士隱常與他交接。"], vernacular: "（白話文）這一天，甄士隱因為夏天白晝長，閒坐在書房裡，手裡捻著佛珠，默默無言。忽然聽到窗外傳來鼓樂的聲音，回頭一看，只見一個人，方臉大耳，身材魁梧，穿著布衣草鞋，醉醺醺地走來。士隱認得，是本地的一個窮書生，姓賈名化，表字時飛，別號雨村。這賈雨村原是湖州人，也是讀書人出身，因為他生在末世，父母祖宗的基業已經敗光，家裡人口也稀少了，只剩下他孤身一人，在家鄉沒有什麼出路，於是進京謀求功名，想再重振家業。從前年來到這裡，又因時運不濟而滯留下來，暫時寄居在姑蘇城外的葫蘆廟裡安身，每天靠賣文章、寫字為生，所以士隱常常和他來往。" },
      { content: ["雨村見士隱，忙施禮陪笑道：「適聞老先生在家，故來一會，不想老先生早已知道了。」士隱笑道：「是，才聽得外面鼓樂喧鬧，想是老兄到了。」雨村道：「正是。小弟此來，一則為賀喜，二則也為告辭。目今小弟正該力圖進取，怎奈囊中羞澀，行止兩難。適蒙老先生厚贈，又承嚴老爺情，許以盤費，兼以薦函，進京鄉試，倘僥倖得中，他日回家拜望，不忘今日之德。」士隱忙笑道：「何出此言！弟少時不知檢束，如今寸心已灰。況且，我輩相交，原無這些俗套。老兄此去，一路順風，高奏凱歌。弟在此靜候佳音便了。」二人敘了些寒溫，雨村便起身作別。士隱直送出門，又囑咐了些言語，方回來。"], vernacular: "（白話文）雨村見到士隱，連忙行禮陪笑說：「剛才聽說老先生在家，所以特地來拜會，沒想到老先生早就知道了。」士隱笑著說：「是的，剛才聽到外面鼓樂喧鬧，想必是兄台到了。」雨村說：「正是。小弟這次來，一是為了道賀，二也是為了告辭。現在小弟正應該努力上進，無奈口袋裡沒錢，去留兩難。剛才承蒙老先生厚贈，又承蒙嚴老爺的情分，答應給予路費，並且還有推薦信，讓我可以進京參加鄉試，如果僥倖考中，將來回家拜望，決不會忘記今天的恩德。」士隱連忙笑著說：「說這些客氣話幹什麼！我年輕時不知道约束自己，如今已經心灰意冷了。況且，我們交往，本來就沒有這些俗套。兄台這次去，一路順風，馬到成功。我就在這裡靜候佳音了。」兩人說了些客套話，雨村便起身告辭。士隱一直把他送到門外，又叮囑了幾句話，才回來。" },
      { content: ["一日，士隱在書房中閒坐，看見一個跛足道人，瘋狂落拓，麻鞋鶉衣，口內念着幾句言詞，道是：「世人都曉神仙好，惟有功名忘不了！古今將相在何方？荒塚一堆草沒了。世人都曉神仙好，只有金銀忘不了！終朝只恨聚無多，及到多時眼閉了。世人都曉神仙好，只有嬌妻忘不了！君生日日說恩情，君死又隨人去了。世人都曉神仙好，只有兒孫忘不了！痴心父母古來多，孝順兒孫誰見了？」士隱聽了，心下早已悟徹，因笑道：「你滿口說些什麼？只聽見些『好了』，『好了』。」那道人笑道：「你若果聽見『好了』二字，還算你明白。可知世上萬般，好便是了，了便是好。若不了，便不好；若要好，須是了。我這歌兒，便名《好了歌》。」"], vernacular: "（白話文）有一天，士隱閒坐在書房裡，看見一個跛腳的道士，瘋瘋癲癲，不修邊幅，穿著麻鞋破衣，嘴裡念叨著幾句話，說的是：「世上的人都知道神仙好，只有功名利祿忘不了！從古到今的將軍宰相在哪裡？只剩下荒墳一堆，長滿了野草。世上的人都知道神仙好，只有金銀財寶忘不了！整天只怨恨聚集得不夠多，等到錢財多了的時候，眼睛卻閉上了。世上的人都知道神仙好，只有漂亮的妻子忘不了！你活著的時候天天說恩愛，你死了之後她又跟別人跑了。世上的人都知道神仙好，只有兒孫後代忘不了！痴心的父母自古以來就很多，孝順的兒孫誰見過呢？」士隱聽了，心裡早已完全明白了，於是笑著說：「你滿口說些什麼？只聽到一些『好了』，『好了』。」那道士笑著說：「你如果真的聽見『好了』兩個字，還算你明白。要知道世上的萬事萬物，好就是了結，了結就是好。如果不能了結，就不好；如果要好，必須了結。我這首歌，就叫《好了歌》。」" },
      { content: ["士隱本是有宿慧的，一聞此言，心中早已徹悟。便走上前道：「這位禪師，請問你從何而來，到何處去？」道人道：「你問我從何而來，我並無來處；你問我到何處去，我亦無去處。天地廣大，我自遨遊。」士隱聽了，點頭稱善。那道人便將葫蘆中之藥，傾入士隱掌中，道：「你將此藥敷在眼上，便可看破一切。」士隱依言，將藥敷上，頓覺神清氣爽，心明眼亮，回頭再看那道人時，已渺無蹤跡。士隱心下感歎不已，遂將家中所有，盡數施捨。隨後便尋訪那跛足道人，不知所之。"], vernacular: "（白話文）士隱本來就有天生的悟性，一聽到這話，心裡早已徹底醒悟。便走上前說：「這位禪師，請問您從哪裡來，要到哪裡去？」道士說：「你問我從哪裡來，我並沒有來處；你問我到哪裡去，我也沒有去處。天地廣大，我自由自在地遨遊。」士隱聽了，點頭稱好。那道士便將葫蘆裡的藥，倒在士隱的手掌中，說：「你把這藥敷在眼睛上，就可以看破一切了。」士隱依照他的話，把藥敷上，頓時覺得神清氣爽，心明眼亮，回頭再看那道士時，已經不見蹤影了。士隱心裡感慨不已，於是將家裡所有的財產，全部施捨出去。隨後便去尋訪那個跛腳的道士，卻不知道他去了哪裡。" },
      { content: ["此回中，甄士隱夢見一僧一道，談論石頭下凡歷劫之事。賈雨村寄居甄家，中秋與甄士隱賞月吟詩，後得甄家資助，上京赴考。甄士隱之女英蓮元宵燈節被拐，甄家隨後又遭火災，家道中落。甄士隱看破紅塵，隨跛足道人出家。"], vernacular: "（白話文）這一回裡，甄士隱夢見一個和尚和一個道士，談論石頭下凡間歷劫的事情。賈雨村寄住在甄家，中秋節和甄士隱一起賞月作詩，後來得到甄家的資助，到京城參加科舉考試。甄士隱的女兒英蓮在元宵節看花燈時被人拐走，甄家隨後又遭遇火災，家境衰落。甄士隱看破紅塵，跟著一個跛腳的道士出家了。" }
    ]
  },
  ...Array.from({ length: 24 }, (_, i) => { 
    const chapterNum = i + 2; 
    return {
      id: chapterNum,
      title: `第 ${chapterNum} 回 示例標題 ${chapterNum}`,
      subtitle: `紅樓夢示例副標題 ${chapterNum}`,
      summary: `這是第 ${chapterNum} 回的摘要。此回主要講述了 [簡短描述] 等情節，展現了 [主要人物] 的 [性格特點或遭遇]。`,
      paragraphs: [
        { content: [`此為第 ${chapterNum} 回示例原文段落一。話說 [某角色] 如何如何...`], vernacular: `（白話文）這是第 ${chapterNum} 回的白話示例段落一。[某角色] 做了些什麼...` },
        { content: [`第 ${chapterNum} 回示例原文段落二，又提及 [另一事件或人物]。此處略去更多內容，僅為演示。`], vernacular: `（白話文）第 ${chapterNum} 回白話示例段落二。又說到了 [其他事情]。` },
      ]
    };
  })
];

type AIInteractionState = 'asking' | 'answering' | 'answered' | 'error';
type ColumnLayout = 'single' | 'double' | 'triple';

export default function ReadPage() {
  const router = useRouter();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [showVernacular, setShowVernacular] = useState(false);
  const [columnLayout, setColumnLayout] = useState<ColumnLayout>('single');
  
  const [isKnowledgeGraphSheetOpen, setIsKnowledgeGraphSheetOpen] = useState(false);
  const [isTocSheetOpen, setIsTocSheetOpen] = useState(false);

  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
  const [userQuestionInput, setUserQuestionInput] = useState<string>('');
  const [textExplanation, setTextExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [aiInteractionState, setAiInteractionState] = useState<AIInteractionState>('asking');

  const [selectedTextInfo, setSelectedTextInfo] = useState<{ text: string; position: { top: number; left: number; } | null; range: Range | null; } | null>(null);
  
  const chapterContentRef = useRef<HTMLDivElement>(null);
  const toolbarTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentChapter = chapters[currentChapterIndex];

  const hideToolbarAfterDelay = useCallback(() => {
    if (toolbarTimeoutRef.current) {
      clearTimeout(toolbarTimeoutRef.current);
    }
    toolbarTimeoutRef.current = setTimeout(() => {
      if (!isAiSheetOpen && !isNoteSheetOpen && !isKnowledgeGraphSheetOpen && !isTocSheetOpen) { 
        setIsToolbarVisible(false);
      }
    }, 5000);
  }, [isAiSheetOpen, isNoteSheetOpen, isKnowledgeGraphSheetOpen, isTocSheetOpen]);

  const handleInteraction = useCallback(() => {
    setIsToolbarVisible(true);
    hideToolbarAfterDelay();
  }, [hideToolbarAfterDelay]);

  useEffect(() => {
    if (isToolbarVisible) {
      hideToolbarAfterDelay();
    }
    return () => {
      if (toolbarTimeoutRef.current) {
        clearTimeout(toolbarTimeoutRef.current);
      }
    };
  }, [isToolbarVisible, hideToolbarAfterDelay, currentChapterIndex, isAiSheetOpen, isNoteSheetOpen, isKnowledgeGraphSheetOpen, isTocSheetOpen]);


  useEffect(() => {
    setSelectedTextInfo(null);
    setIsNoteSheetOpen(false);
    setCurrentNote("");
    setIsAiSheetOpen(false);
    setTextExplanation(null);
    setUserQuestionInput('');
    setAiInteractionState('asking');
    setIsKnowledgeGraphSheetOpen(false);
    setIsTocSheetOpen(false);
    setIsToolbarVisible(true); 
  }, [currentChapterIndex]);

  const handleMouseUp = useCallback((event: globalThis.MouseEvent) => {
    const targetElement = event.target as HTMLElement;
  
    if (targetElement?.closest('[data-radix-dialog-content]') || 
        targetElement?.closest('[data-radix-popover-content]') ||
        targetElement?.closest('[data-selection-action-button="true"]')) {
      setTimeout(() => handleInteraction(), 0);
      return;
    }
  
    if (targetElement?.closest('[data-no-selection="true"]')) {
      setSelectedTextInfo(null);
      setTimeout(() => handleInteraction(), 0);
      return;
    }
    
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';
  
    if (text.length > 0 && chapterContentRef.current && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (chapterContentRef.current.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        const scrollAreaElement = document.getElementById('chapter-content-scroll-area');
        const scrollTop = scrollAreaElement?.scrollTop || window.scrollY || 0;
        const scrollLeft = scrollAreaElement?.scrollLeft || window.scrollX || 0;
        
        const top = rect.bottom + scrollTop + 8; 
        const left = rect.left + scrollLeft + (rect.width / 2); 
  
        setSelectedTextInfo({ text, position: { top, left }, range: range.cloneRange() });
        setIsAiSheetOpen(false); 
        setIsNoteSheetOpen(false);
      } else {
        setSelectedTextInfo(null);
      }
    } else {
      setSelectedTextInfo(null);
    }
    setTimeout(() => handleInteraction(), 0);
  }, [handleInteraction]);


  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('scroll', handleInteraction, { passive: true, capture: true }); 
    document.addEventListener('mousemove', handleInteraction, { passive: true, capture: true });

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('scroll', handleInteraction, { capture: true });
      document.removeEventListener('mousemove', handleInteraction, { capture: true });
      if (toolbarTimeoutRef.current) clearTimeout(toolbarTimeoutRef.current);
    };
  }, [handleInteraction, handleMouseUp]);


  const handleOpenAiSheet = () => {
    if (selectedTextInfo?.text) {
      setTextExplanation(null);
      setUserQuestionInput('');
      setAiInteractionState('asking');
      setIsAiSheetOpen(true);
      setIsNoteSheetOpen(false); 
      handleInteraction();
    }
  };
  
  const handleOpenNoteSheet = () => {
    if (selectedTextInfo?.text) {
      setIsNoteSheetOpen(true);
      setIsAiSheetOpen(false);
      handleInteraction();
    }
  };

  const handleUserSubmitQuestion = async () => {
    if (!selectedTextInfo?.text || !userQuestionInput.trim() || !currentChapter) return;
    setIsLoadingExplanation(true);
    setAiInteractionState('answering');
    setTextExplanation(null);
    try {
      const input: ExplainTextSelectionInput = {
        selectedText: selectedTextInfo.text,
        chapterContext: currentChapter.paragraphs.flatMap(p => p.content).filter(item => typeof item === 'string').join(' ').substring(0, 1000),
        userQuestion: userQuestionInput,
      };
      const result = await explainTextSelection(input);
      setTextExplanation(result.explanation);
      setAiInteractionState('answered');
    } catch (error) {
      console.error("Error explaining selected text:", error);
      setTextExplanation(error instanceof Error ? error.message : "抱歉，回答您的問題時發生錯誤。");
      setAiInteractionState('error');
    }
    setIsLoadingExplanation(false);
  };
  
  const getColumnClass = () => {
    switch (columnLayout) {
      case 'single': return 'columns-1';
      case 'double': return 'md:columns-2';
      case 'triple': return 'md:columns-3';
      default: return 'columns-1';
    }
  };

  const handleSelectChapterFromToc = (index: number) => {
    setCurrentChapterIndex(index);
    setIsTocSheetOpen(false); 
    handleInteraction(); 
  };

  const toolbarButtonBaseClass = "flex flex-col items-center justify-center h-auto p-2 text-muted-foreground hover:text-primary";
  const toolbarIconClass = "h-6 w-6"; 
  const toolbarLabelClass = "mt-1 text-xs leading-none";

  return (
    <div className="h-full flex flex-col">
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-lg p-2 transition-all duration-300 ease-in-out",
          isToolbarVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
        )}
        data-no-selection="true" 
        onClick={(e) => { e.stopPropagation(); handleInteraction(); }} 
      >
        <div className="container mx-auto flex items-center justify-between max-w-screen-xl">
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" className={toolbarButtonBaseClass} onClick={() => router.push('/dashboard')} title="返回首頁">
              <CornerUpLeft className={toolbarIconClass} />
              <span className={toolbarLabelClass}>返回</span>
            </Button>
            <Button variant="ghost" className={toolbarButtonBaseClass} title="設定" disabled>
              <Settings className={toolbarIconClass} />
              <span className={toolbarLabelClass}>設定</span>
            </Button>
            <div className="h-10 border-l border-border/50 mx-2 md:mx-3"></div> 
            <Button variant={columnLayout === 'single' ? 'secondary' : 'ghost'} className={toolbarButtonBaseClass} onClick={() => setColumnLayout('single')} title="單欄">
              <AlignLeft className={toolbarIconClass}/>
              <span className={toolbarLabelClass}>單欄</span>
            </Button>
            <Button variant={columnLayout === 'double' ? 'secondary' : 'ghost'} className={toolbarButtonBaseClass} onClick={() => setColumnLayout('double')} title="雙欄">
              <AlignCenter className={toolbarIconClass}/>
              <span className={toolbarLabelClass}>雙欄</span>
            </Button>
            <Button variant={columnLayout === 'triple' ? 'secondary' : 'ghost'} className={toolbarButtonBaseClass} onClick={() => setColumnLayout('triple')} title="三欄">
              <AlignJustify className={toolbarIconClass}/>
              <span className={toolbarLabelClass}>三欄</span>
            </Button>
          </div>
          
          <div className="text-center overflow-hidden flex-grow px-2 mx-2 md:mx-4">
            <h1 className="text-base md:text-lg font-semibold text-primary truncate">{currentChapter.title}</h1>
            {currentChapter.subtitle && <p className="text-sm text-muted-foreground truncate">{currentChapter.subtitle}</p>}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" className={toolbarButtonBaseClass} onClick={() => setShowVernacular(!showVernacular)} title={showVernacular ? "隱藏白話文" : "顯示白話文"}>
              {showVernacular ? <EyeOff className={toolbarIconClass}/> : <Eye className={toolbarIconClass}/>}
              <span className={toolbarLabelClass}>{showVernacular ? "隱藏白話" : "顯示白話"}</span>
            </Button>
            <Button variant="ghost" className={toolbarButtonBaseClass} onClick={() => { setIsKnowledgeGraphSheetOpen(true); handleInteraction(); }} title="知識圖譜">
              <Map className={toolbarIconClass}/>
              <span className={toolbarLabelClass}>圖譜</span>
            </Button>
            <Button variant="ghost" className={toolbarButtonBaseClass} onClick={() => { setIsTocSheetOpen(true); handleInteraction(); }} title="目錄">
              <List className={toolbarIconClass}/>
              <span className={toolbarLabelClass}>目錄</span>
            </Button>
            <div className="h-10 border-l border-border/50 mx-2 md:mx-3"></div> 
            <Button variant="ghost" className={toolbarButtonBaseClass} title="書內搜尋" disabled>
              <SearchIcon className={toolbarIconClass} />
              <span className={toolbarLabelClass}>搜尋</span>
            </Button>
            <Button variant="ghost" className={toolbarButtonBaseClass} title="全螢幕" disabled>
              <Maximize className={toolbarIconClass} />
              <span className={toolbarLabelClass}>全螢幕</span>
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-grow pt-24 pb-10 px-4 md:px-8" id="chapter-content-scroll-area">
        <div
          ref={chapterContentRef}
          className={cn(
            "prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none mx-auto leading-relaxed whitespace-pre-line text-foreground select-text",
            getColumnClass()
          )}
          style={{ fontFamily: "'Noto Serif SC', serif", position: 'relative' }}
        >
          {currentChapter.paragraphs.map((para, paraIndex) => (
            <div key={paraIndex} className="mb-4 break-inside-avoid-column">
              <p className="text-white">
                {para.content.map((item, itemIndex) => {
                  if (typeof item === 'string') {
                    return <React.Fragment key={itemIndex}>{item}</React.Fragment>;
                  } else {
                    // Item is an Annotation object
                    return (
                      <React.Fragment key={item.id}>
                        {item.text}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="inline-flex items-center justify-center w-4 h-4 p-0 mx-0.5 text-[9px] align-middle bg-green-200 text-green-700 dark:bg-green-600 dark:text-green-100 rounded-full leading-none hover:bg-green-300 dark:hover:bg-green-500 focus:outline-none focus:ring-1 focus:ring-green-400 dark:focus:ring-green-500 shadow-sm"
                              style={{ position: 'relative', top: '-0.2em' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              註
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            side="top"
                            align="center"
                            sideOffset={5}
                            className="w-full max-w-md p-4 text-sm shadow-xl bg-card text-card-foreground border border-border rounded-md"
                            onClick={(e) => e.stopPropagation()} 
                          >
                            <div className="relative">
                              <PopoverClose className="absolute top-1 right-1 rounded-full p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                                <X className="h-3.5 w-3.5" />
                              </PopoverClose>
                              <p className="whitespace-pre-wrap pr-4">{item.note}</p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </React.Fragment>
                    );
                  }
                })}
              </p>
              {showVernacular && para.vernacular && (
                <p className="italic text-muted-foreground mt-1 text-sm">{para.vernacular}</p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {selectedTextInfo?.text && selectedTextInfo.position && !isAiSheetOpen && !isNoteSheetOpen && (
        <div
            className="fixed flex gap-2"
            style={{
                top: `${selectedTextInfo.position.top}px`,
                left: `${selectedTextInfo.position.left}px`,
                transform: 'translateX(-50%)',
                zIndex: 60,
            }}
            data-selection-action-button="true"
          >
            <Button
                variant="default"
                size="sm"
                className="bg-amber-500 text-white hover:bg-amber-600 shadow-lg flex items-center"
                onClick={handleOpenNoteSheet}
                data-selection-action-button="true"
                >
                <Edit3 className="h-4 w-4 mr-1" /> 記筆記
            </Button>
            <Button
                variant="default"
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg flex items-center"
                onClick={handleOpenAiSheet}
                data-selection-action-button="true"
                >
                <MessageSquare className="h-4 w-4 mr-1" /> 問 AI
            </Button>
        </div>
      )}
      
      <Sheet open={isKnowledgeGraphSheetOpen} onOpenChange={setIsKnowledgeGraphSheetOpen}>
        <SheetContent 
            side="bottom" 
            className="h-[80vh] bg-card text-card-foreground p-0 flex flex-col" 
            data-no-selection="true" 
            onClick={(e) => {e.stopPropagation(); handleInteraction();}}
        >
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="text-primary text-xl font-artistic">章回知識圖譜: {currentChapter.title}</SheetTitle>
            <SheetDescription>
              呈現本章回主要概念之間的關聯。(此為模擬圖，實際圖譜會基於文本動態生成)
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-grow p-4">
            <SimulatedKnowledgeGraph className="w-full min-h-[300px]" />
          </ScrollArea>
          <SheetFooter className="p-4 border-t border-border">
            <SheetClose asChild>
              <Button variant="outline" onClick={() => handleInteraction()}>關閉</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={isTocSheetOpen} onOpenChange={setIsTocSheetOpen}>
        <SheetContent 
            side="left" 
            className="w-[300px] sm:w-[350px] bg-card text-card-foreground p-0 flex flex-col" 
            data-no-selection="true" 
            onClick={(e) => {e.stopPropagation(); handleInteraction();}}
        >
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="text-primary text-xl font-artistic">目錄</SheetTitle>
            <SheetDescription>
              選擇章回以快速跳轉。
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-grow">
            <div className="p-2 space-y-1">
            {chapters.map((chapter, index) => (
              <Button
                key={chapter.id}
                variant={currentChapterIndex === index ? "default" : "ghost"}
                className="w-full justify-start text-left h-auto py-1.5 px-3 text-sm"
                onClick={() => handleSelectChapterFromToc(index)}
              >
                {chapter.title}
              </Button>
            ))}
            </div>
          </ScrollArea>
          <SheetFooter className="p-4 border-t border-border">
             <SheetClose asChild>
                <Button variant="outline" onClick={() => handleInteraction()}>關閉</Button>
             </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={isNoteSheetOpen} onOpenChange={setIsNoteSheetOpen}>
        <SheetContent 
            side="right" 
            className="w-[400px] sm:w-[540px] bg-card text-card-foreground p-0 flex flex-col" 
            data-no-selection="true" 
            onClick={(e) => {e.stopPropagation(); handleInteraction();}}
        >
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="text-primary text-xl font-artistic">撰寫筆記</SheetTitle>
            <SheetDescription>
              針對您選取的內容記錄您的想法。
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-grow p-4 space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">選取內容:</Label>
              <blockquote className="mt-1 p-2 border-l-4 border-primary bg-primary/10 text-sm text-white rounded-sm max-h-32 overflow-y-auto">
                {selectedTextInfo?.text || "未選取任何內容。"}
              </blockquote>
            </div>
            <div>
              <Label htmlFor="noteTextarea" className="text-sm text-muted-foreground">您的筆記:</Label>
              <Textarea
                id="noteTextarea"
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="在此輸入您的筆記..."
                className="min-h-[200px] bg-background/70 mt-1"
                rows={8}
              />
            </div>
          </ScrollArea>
          <SheetFooter className="p-4 border-t border-border flex justify-between">
            <SheetClose asChild>
              <Button variant="outline" onClick={() => {setIsNoteSheetOpen(false); setSelectedTextInfo(null); handleInteraction();}}>取消</Button>
            </SheetClose>
            <Button
              onClick={() => {
                console.log("Saving note for text:", selectedTextInfo?.text);
                console.log("Note content:", currentNote);
                setIsNoteSheetOpen(false);
                setSelectedTextInfo(null); 
                handleInteraction();
              }}
              className="bg-primary hover:bg-primary/90"
            >
              保存筆記
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={isAiSheetOpen} onOpenChange={setIsAiSheetOpen}>
        <SheetContent 
            side="right" 
            className="w-[400px] sm:w-[540px] bg-card text-card-foreground p-0 flex flex-col" 
            data-no-selection="true" 
            onClick={(e) => {e.stopPropagation(); handleInteraction();}}
        >
            <SheetHeader className="p-4 border-b border-border">
                <SheetTitle className="text-primary text-xl font-artistic">問 AI</SheetTitle>
                <SheetDescription>針對選取的文本提出您的疑問。</SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-grow p-4 space-y-3">
                {selectedTextInfo?.text && (
                    <div>
                        <Label className="text-sm text-muted-foreground">選取內容:</Label>
                        <blockquote className="mt-1 p-2 border-l-4 border-primary bg-primary/10 text-sm text-white rounded-sm max-h-32 overflow-y-auto">
                            {selectedTextInfo.text.length > 150 ? selectedTextInfo.text.substring(0, 150) + '...' : selectedTextInfo.text}
                        </blockquote>
                    </div>
                )}
                
                <div className="space-y-4"> 
                    <div>
                        <Label htmlFor="userQuestionAiSheet" className="text-sm text-muted-foreground">您的問題：</Label>
                        <Textarea
                            id="userQuestionAiSheet"
                            value={userQuestionInput}
                            onChange={(e) => setUserQuestionInput(e.target.value)}
                            placeholder="請輸入您想問的問題..."
                            className="min-h-[100px] text-sm bg-background/70 mt-1"
                            rows={4}
                            disabled={aiInteractionState === 'answering' || aiInteractionState === 'answered'}
                        />
                    </div>
                    {aiInteractionState === 'asking' && (
                        <Button onClick={handleUserSubmitQuestion} disabled={isLoadingExplanation || !userQuestionInput.trim()} className="w-full">
                            {isLoadingExplanation ? "傳送中..." : "送出問題"}
                        </Button>
                    )}
                </div>

                {(aiInteractionState === 'answering') && (
                     <div className="p-4 flex flex-col items-center justify-center text-muted-foreground">
                        <Lightbulb className="h-8 w-8 mb-2 animate-pulse text-primary" />
                        AI 思考中...
                    </div>
                )}
                {(aiInteractionState === 'answered' || aiInteractionState === 'error') && textExplanation && (
                    <div>
                        <h4 className="font-semibold mb-2 text-primary">AI 回答：</h4>
                        <ScrollArea className="h-60 p-1 border rounded-md bg-muted/10">
                           <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line p-2 text-white">
                            {textExplanation}
                          </ReactMarkdown>
                        </ScrollArea>
                        <Button variant="ghost" onClick={() => {setAiInteractionState('asking'); setUserQuestionInput(''); setTextExplanation(null); setSelectedTextInfo(null); handleInteraction();}} className="mt-2 text-sm">
                          返回提問
                        </Button>
                    </div>
                )}
            </ScrollArea>
            <SheetFooter className="p-4 border-t border-border">
                 <SheetClose asChild>
                    <Button variant="outline" onClick={() => {setIsAiSheetOpen(false); setSelectedTextInfo(null); handleInteraction();}}>關閉</Button>
                 </SheetClose>
            </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
    

    