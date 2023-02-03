import { proxyActivities, sleep, continueAsNew, defineQuery, setHandler} from '@temporalio/workflow';
import ms from 'ms';
import type * as activities from './activities';

const { getAccessToken } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export const getSalesforceAccessToken = defineQuery<string | undefined>('getToken');

export interface Input {
  sfdcAccessToken?: string;
  lastRefreshed: number;
}

const tokenExpiryPeriod = ms('2 hours');
const tokenRefreshInterval = ms('90 minute');

export async function refreshSalesforceAccessToken({lastRefreshed, sfdcAccessToken}: Input = {lastRefreshed: 0}): Promise<void> {
  try {
    // Setup a query handler.
    setHandler(getSalesforceAccessToken, () => 
      Date.now() - lastRefreshed < tokenExpiryPeriod ? sfdcAccessToken : undefined
    );
    
    sfdcAccessToken = await getAccessToken();
    lastRefreshed = Date.now();

    await sleep(tokenRefreshInterval);
    await continueAsNew<typeof refreshSalesforceAccessToken>({lastRefreshed, sfdcAccessToken});
  } catch (e) {
    throw e;
  }
}