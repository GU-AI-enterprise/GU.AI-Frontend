import { useCallback, useEffect, useState } from "react";
import { getImages, type DBAsset } from "./imageService";
import { getCollections, type Collection } from "./collectionService";

export function useGallery() {
  const [assets, setAssets] = useState<DBAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setAssets(await getImages()); } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { assets, setAssets, loading, refresh };
}

export function useCollectionList() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setCollections(await getCollections()); } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { collections, setCollections, loading, refresh };
}
